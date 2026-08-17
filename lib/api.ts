const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const REQUEST_TIMEOUT = 15000; // 15 seconds

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Extract the most specific error message the backend gives us.
// Handles NestJS-style shapes: { message: string }, { message: string[] },
// { error: string }, { errors: [...] }, and falls back to the status code.
export function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;

    // message can be a string or an array of validation strings
    if (Array.isArray(d.message)) {
      const joined = d.message.filter(Boolean).join(", ");
      if (joined) return joined;
    } else if (typeof d.message === "string" && d.message) {
      return d.message;
    }

    // some APIs use `error` or an `errors` array/object
    if (typeof d.error === "string" && d.error) return d.error;
    if (Array.isArray(d.errors)) {
      const joined = d.errors
        .map((e) =>
          typeof e === "string" ? e : (e as Record<string, unknown>)?.message
        )
        .filter(Boolean)
        .join(", ");
      if (joined) return joined;
    }
  }

  return `Request failed (${status})`;
}

function handleAuthFailure() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  document.cookie = "token=; path=/; max-age=0";
  window.location.href = "/login";
}

// Track if a refresh is already in progress to avoid concurrent refreshes
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken = data.accessToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
      document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      // Update refresh token if a new one is returned
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function getRefreshedToken(): Promise<string | null> {
  // If a refresh is already in progress, wait for it instead of firing another
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken();
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // If token is expired, try refreshing before making the request
  if (token && isTokenExpired(token)) {
    const newToken = await getRefreshedToken();
    if (newToken) {
      token = newToken;
    } else {
      handleAuthFailure();
      throw new Error("Session expired. Please log in again.");
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    // On 401 (not auth endpoints), try refresh before giving up
    if (res.status === 401 && !endpoint.startsWith("/auth/")) {
      const newToken = await getRefreshedToken();
      if (newToken) {
        // Retry the original request with the new token
        const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...headers,
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });

        const retryText = await retryRes.text();
        const retryData = retryText ? JSON.parse(retryText) : null;

        if (!retryRes.ok) {
          if (retryRes.status === 401 || retryRes.status === 403) {
            handleAuthFailure();
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(extractErrorMessage(retryData, retryRes.status));
        }

        return retryData as T;
      }

      handleAuthFailure();
      throw new Error("Session expired. Please log in again.");
    }

    if (res.status === 403 && !endpoint.startsWith("/auth/")) {
      handleAuthFailure();
      throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
      // Surface the raw server body in dev to make debugging 4xx/5xx easier
      if (process.env.NODE_ENV !== "production") {
        console.error(`API ${method} ${endpoint} failed (${res.status}):`, data);
      }
      throw new Error(extractErrorMessage(data, res.status));
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection.");
    }

    // Browser network failure (offline, DNS, CORS, etc.)
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }

    throw err;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const REQUEST_TIMEOUT = 10000; // 10 seconds

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function handleAuthFailure() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = "token=; path=/; max-age=0";
  window.location.href = "/login";
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Check expired token before making request — avoid slow server timeout
  if (token && isTokenExpired(token)) {
    handleAuthFailure();
    throw new Error("Session expired. Please log in again.");
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

    // Redirect on auth errors — but not on login endpoint (let login show its own error)
    if ((res.status === 401 || res.status === 403) && !endpoint.startsWith("/auth/")) {
      handleAuthFailure();
      throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
      throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection.");
    }

    throw err;
  }
}

import { api } from "./api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    branchId: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });

  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
    document.cookie = `token=${data.accessToken}; path=/; max-age=${60 * 60}; SameSite=Lax`;
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  return data;
}

export async function logout() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Continue with local cleanup even if API call fails
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  document.cookie = "token=; path=/; max-age=0";
  window.location.href = "/login";
}

// ── Register (private — requires auth) ──

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  branchId: string;
  role: "USER" | "ADMIN";
};

export async function registerUser(payload: RegisterPayload): Promise<void> {
  await api("/auth/private/register", {
    method: "POST",
    body: payload,
  });
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

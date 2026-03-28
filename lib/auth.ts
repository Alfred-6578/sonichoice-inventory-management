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
  }

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
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

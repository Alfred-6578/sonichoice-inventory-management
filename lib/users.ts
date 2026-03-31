import { api } from "./api";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  branchId: string;
  branch?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

type UsersResponse = {
  message: string;
  data: ApiUser[];
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
};

export type GetUsersFilters = {
  page?: number;
  search?: string;
  role?: string;
  branchId?: string;
};

export async function getUsers(filters: GetUsersFilters = {}): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.branchId) params.set("branchId", filters.branchId);

  const query = params.toString();
  return api<UsersResponse>(`/users${query ? `?${query}` : ""}`);
}

// ── Update User ──

export type UpdateUserPayload = {
  name?: string;
  phone?: string;
  role?: "USER" | "ADMIN";
  branchId?: string;
};

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
  await api(`/users/${id}`, { method: "PATCH", body: payload });
}

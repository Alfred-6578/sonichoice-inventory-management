import { api } from "./api";

export type ApiMerchant = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: unknown[];
};

type MerchantsResponse = {
  message: string;
  data: ApiMerchant[];
  meta?: { total: number; page: number; lastPage: number };
};

export type MerchantFilters = {
  search?: string;
  status?: string;
};

export async function getMerchants(
  filters: MerchantFilters = {}
): Promise<MerchantsResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return api<MerchantsResponse>(`/merchant${query ? `?${query}` : ""}`);
}

// ── Create ──

export type CreateMerchantPayload = {
  name: string;
  email: string;
  phone: string;
  color: string;
  status: "ACTIVE" | "INACTIVE";
};

export async function createMerchant(
  payload: CreateMerchantPayload
): Promise<ApiMerchant> {
  return api<ApiMerchant>("/merchant", {
    method: "POST",
    body: payload,
  });
}

// ── Update ──

export type UpdateMerchantPayload = {
  name?: string;
  email?: string;
  phone?: string;
  color?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export async function updateMerchant(
  id: string,
  payload: UpdateMerchantPayload
): Promise<void> {
  await api(`/merchant/${id}`, { method: "PATCH", body: payload });
}

// ── Delete ──

export async function deleteMerchant(id: string): Promise<void> {
  await api(`/merchant/${id}`, { method: "DELETE" });
}

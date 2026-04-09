import { api } from "./api";

export type ApiMerchantStock = {
  id: string;
  quantity: number;
  lowStockAlert: number;
  branch?: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ApiMerchantProduct = {
  id: string;
  trackingId?: string;
  name: string;
  description?: string | null;
  stocks?: ApiMerchantStock[];
  dateReceived?: string | null;
  additionalInfo?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

export type ApiMerchant = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: ApiMerchantProduct[];
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
  email?: string;
  phone?: string;
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

// ── Export ──

export async function exportMerchants(format: "pdf" | "excel"): Promise<void> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}/merchant/export/${format}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const ext = format === "pdf" ? "pdf" : "xlsx";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `merchants-export.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Delete ──

export async function deleteMerchant(id: string): Promise<void> {
  await api(`/merchant/${id}`, { method: "DELETE" });
}

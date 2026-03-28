import { api } from "./api";

// ── Types ──

export type ApiParcelItem = {
  id: string;
  parcelId: string;
  productId: string;
  product?: {
    id: string;
    trackingId?: string;
    merchantId?: string;
    name: string;
    description?: string | null;
    [key: string]: unknown;
  };
  quantity: number;
};

export type ApiParcelBranch = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  [key: string]: unknown;
};

export type ApiParcelMerchant = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
  status?: string;
  [key: string]: unknown;
};

export type ApiParcel = {
  id: string;
  trackingNumber: string;
  merchantId: string;
  merchant?: ApiParcelMerchant;
  merchants?: ApiParcelMerchant[];
  size: string;
  fromBranchId: string;
  fromBranch?: ApiParcelBranch;
  toBranchId: string;
  toBranch?: ApiParcelBranch;
  currentBranchId: string;
  currentBranch?: ApiParcelBranch;
  items?: ApiParcelItem[];
  status: string;
  dateShipped?: string | null;
  dateDelivered?: string | null;
  additionalInfo?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ParcelsResponse = {
  message: string;
  data: ApiParcel[];
  meta?: { total: number; page: number; lastPage: number };
};

// ── Get All ──

export type ParcelFilters = {
  page?: number;
  search?: string;
  merchantId?: string;
  status?: string;
  fromBranchId?: string;
  toBranchId?: string;
};

export async function getParcels(
  filters: ParcelFilters = {}
): Promise<ParcelsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.search) params.set("search", filters.search);
  if (filters.merchantId) params.set("merchantId", filters.merchantId);
  if (filters.status) params.set("status", filters.status);
  if (filters.fromBranchId) params.set("fromBranchId", filters.fromBranchId);
  if (filters.toBranchId) params.set("toBranchId", filters.toBranchId);
  const query = params.toString();
  return api<ParcelsResponse>(`/parcels${query ? `?${query}` : ""}`);
}

// ── Create ──

export type CreateParcelPayload = {
  merchantId: string;
  fromBranchId: string;
  toBranchId: string;
  size?: "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE";
  additionalInfo?: string;
  items: { productId: string; quantity: number }[];
};

export async function createParcel(
  payload: CreateParcelPayload
): Promise<ApiParcel> {
  return api<ApiParcel>("/parcels", {
    method: "POST",
    body: payload,
  });
}

// ── Update Status ──

export type ParcelStatusValue = "PENDING" | "IN_TRANSIT" | "RECEIVED" | "RETURNED" | "CANCELLED";

export async function updateParcelStatus(
  id: string,
  status: ParcelStatusValue
): Promise<ApiParcel> {
  return api<ApiParcel>(`/parcels/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

// ── Update ──

export type UpdateParcelPayload = {
  size?: "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE";
  toBranchId?: string;
  additionalInfo?: string;
  items?: { productId: string; quantity: number }[];
};

export async function updateParcel(
  id: string,
  payload: UpdateParcelPayload
): Promise<ApiParcel> {
  return api<ApiParcel>(`/parcels/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

// ── Delete ──

export async function deleteParcel(id: string): Promise<void> {
  await api(`/parcels/${id}`, { method: "DELETE" });
}

// ── Get Single ──

export async function getParcel(id: string): Promise<ApiParcel> {
  return api<ApiParcel>(`/parcels/${id}`);
}

// ── Export ──

export async function exportParcels(format: "pdf" | "excel"): Promise<void> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}/parcels/export/${format}`, {
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
  a.download = `parcels-export.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

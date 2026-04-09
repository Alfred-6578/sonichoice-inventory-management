import { api } from "./api";

export type ApiBranchStock = {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  lowStockAlert: number;
  product?: {
    id: string;
    name: string;
    trackingId?: string;
    merchantId?: string;
    description?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ApiBranchUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: unknown;
};

export type ApiBranch = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string | null;
  country?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  productStocks?: ApiBranchStock[];
  totalProducts?: number;
  productsInTransit?: number;
  productsDelivered?: number;
  users?: ApiBranchUser[];
  invites?: unknown[];
  _count?: {
    productStocks?: number;
    parcelsFrom?: number;
    parcelsTo?: number;
  };
};

type BranchesResponse = {
  message: string;
  data: ApiBranch[];
};

export async function getBranches(): Promise<ApiBranch[]> {
  const res = await api<BranchesResponse>("/branches");
  return res.data || [];
}

export type CreateBranchPayload = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
};

// ── Update ──

export type UpdateBranchPayload = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
};

export async function updateBranch(
  id: string,
  payload: UpdateBranchPayload
): Promise<void> {
  await api(`/branches/${id}`, { method: "PATCH", body: payload });
}

// ── Delete ──

export async function deleteBranch(id: string): Promise<void> {
  await api(`/branches/${id}`, { method: "DELETE" });
}

// ── Create ──

export async function createBranch(
  payload: CreateBranchPayload
): Promise<ApiBranch> {
  return api<ApiBranch>("/branches", {
    method: "POST",
    body: payload,
  });
}

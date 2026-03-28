import { api } from "./api";

// ── Filter / List ──

export type ProductFilters = {
  page?: number;
  limit?: number;
  search?: string;
  merchantId?: string;
  branchId?: string;
};

export type ApiMerchant = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
  status?: string;
  [key: string]: unknown;
};

export type ApiBranch = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  [key: string]: unknown;
};

export type ApiProduct = {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  merchantId?: string;
  branchId?: string;
  dateReceived?: string;
  additionalInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  merchant?: ApiMerchant;
  branch?: ApiBranch;
  [key: string]: unknown;
};

export type ProductsResponse = {
  products?: ApiProduct[];
  data?: ApiProduct[];
  total?: number;
  totalPages?: number;
  page?: number;
  [key: string]: unknown;
};

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.merchantId) params.set("merchantId", filters.merchantId);
  if (filters.branchId) params.set("branchId", filters.branchId);

  const query = params.toString();
  const endpoint = `/products${query ? `?${query}` : ""}`;

  return api<ProductsResponse>(endpoint);
}

// ── Get Single ──

export async function getProduct(id: string): Promise<ApiProduct> {
  return api<ApiProduct>(`/products/${id}`);
}

// ── Create ──

export type BranchEntry = {
  branchId: string;
  quantity: number;
  lowStockAlert: number;
};

export type CreateProductPayload = {
  name: string;
  merchantId: string;
  description?: string;
  dateReceived?: string;
  additionalInfo?: string;
  branches: BranchEntry[];
};

export async function createProduct(
  payload: CreateProductPayload
): Promise<ApiProduct> {
  return api<ApiProduct>("/products", {
    method: "POST",
    body: payload,
  });
}

// ── Update ──

export type UpdateProductPayload = {
  name?: string;
  quantity?: number;
  description?: string;
  additionalInfo?: string;
};

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<ApiProduct> {
  return api<ApiProduct>(`/products/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

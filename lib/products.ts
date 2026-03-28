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

export type ApiStock = {
  id?: string;
  productId?: string;
  branchId?: string;
  quantity?: number;
  lowStockAlert?: number;
  branch?: ApiBranch;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type ApiProduct = {
  id: string;
  trackingId?: string;
  name: string;
  description?: string | null;
  quantity?: number;
  merchantId?: string;
  branchId?: string;
  dateReceived?: string | null;
  additionalInfo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  merchant?: ApiMerchant;
  branch?: ApiBranch;
  stocks?: ApiStock[];
  [key: string]: unknown;
};

export type ProductsMeta = {
  total: number;
  page: number;
  lastPage: number;
};

export type ProductsResponse = {
  products?: ApiProduct[];
  data?: ApiProduct[];
  meta?: ProductsMeta;
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

// ── Delete ──

export async function deleteProduct(id: string): Promise<void> {
  await api(`/products/${id}`, { method: "DELETE" });
}

// ── Update ──

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  additionalInfo?: string;
  branches?: BranchEntry[];
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

// ── Export ──

export async function exportProducts(format: "pdf" | "excel"): Promise<void> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}/products/export/${format}`, {
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
  a.download = `products-export.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
};

type MerchantsResponse = {
  message: string;
  data: ApiMerchant[];
};

export async function getMerchants(): Promise<ApiMerchant[]> {
  const res = await api<MerchantsResponse>("/merchant");
  return res.data || [];
}

export type CreateMerchantPayload = {
  name: string;
  email: string;
  phone: string;
  color: string;
  status: "ACTIVE" | "INACTIVE"
};

export async function createMerchant(
  payload: CreateMerchantPayload
): Promise<ApiMerchant> {
  return api<ApiMerchant>("/merchant", {
    method: "POST",
    body: payload,
  });
}

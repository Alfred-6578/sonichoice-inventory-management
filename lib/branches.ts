import { api } from "./api";

export type ApiBranch = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BranchesResponse = {
  message: string;
  data: ApiBranch[];
};

export async function getBranches(): Promise<ApiBranch[]> {
  const res = await api<BranchesResponse>("/branches");
  return res.data || [];
}

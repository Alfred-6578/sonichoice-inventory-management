import { api } from "./api";

export type DashboardParcelStats = {
  total: number;
  inTransit: number;
  received: number;
  pending: number;
  returned: number;
  cancelled: number;
  thisMonth: number;
  lastMonth: number;
  monthlyGrowth: number;
};

export type DashboardOverview = {
  activeMerchants: number;
  totalBranches: number;
};

export type DashboardRecentParcel = {
  id: string;
  trackingNumber: string;
  status: string;
  size?: string;
  fromBranchId?: string;
  toBranchId?: string;
  fromBranch?: { id: string; name: string };
  toBranch?: { id: string; name: string };
  merchants?: { id: string; name: string; color?: string }[];
  merchant?: { id: string; name: string; color?: string };
  createdAt?: string;
  [key: string]: unknown;
};

export type DashboardBranchHolding = {
  id: string;
  name: string;
  city: string;
  state: string;
  totalStock: number;
  productCount: number;
  lowStockItems: number;
  inTransitOut: number;
  received: number;
};

export type DashboardTopMerchant = {
  id: string;
  name: string;
  color: string;
  totalParcels: number;
  totalProducts: number;
};

export type DashboardActivity = {
  id?: string;
  type?: string;
  title?: string;
  meta?: string;
  time?: string;
  [key: string]: unknown;
};

export type DashboardData = {
  parcelStats: DashboardParcelStats;
  overview: DashboardOverview;
  recentParcels: DashboardRecentParcel[];
  branchHoldings: DashboardBranchHolding[];
  topMerchants: DashboardTopMerchant[];
  recentActivity: DashboardActivity[];
};

type DashboardResponse = {
  message: string;
  data: DashboardData;
};

export async function getDashboard(): Promise<DashboardData> {
  const res = await api<DashboardResponse>("/dashboard");
  return res.data;
}

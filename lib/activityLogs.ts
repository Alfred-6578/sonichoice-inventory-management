import { api } from "./api";

export type ActivityLogEntry = {
  id: string;
  action: string;
  userId?: string;
  branchId?: string;
  userName?: string;
  userEmail?: string;
  branchName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  [key: string]: unknown;
};

export type ActivityLogKeywordCounts = {
  all: number;
  parcel: number;
  product: number;
  stock: number;
  merchant: number;
  branch: number;
  user: number;
  login: number;
  logout: number;
  other: number;
};

export type ActivityLogsResponse = {
  message?: string;
  data: ActivityLogEntry[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
  keywordCounts: ActivityLogKeywordCounts;
};

export type GetActivityLogsFilters = {
  page?: number;
  search?: string;
  actionKeyword?: string;
  userId?: string;
  branchId?: string;
};

function buildQuery(filters: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getActivityLogs(
  filters: GetActivityLogsFilters = {}
): Promise<ActivityLogsResponse> {
  return api<ActivityLogsResponse>(`/activity-logs${buildQuery(filters)}`);
}

export async function getMyActivityLogs(
  filters: { page?: number; search?: string; actionKeyword?: string } = {}
): Promise<ActivityLogsResponse> {
  return api<ActivityLogsResponse>(`/activity-logs/me${buildQuery(filters)}`);
}

export async function getUserActivityLogs(
  userId: string,
  filters: { page?: number } = {}
): Promise<ActivityLogsResponse> {
  return api<ActivityLogsResponse>(`/activity-logs/user/${userId}${buildQuery(filters)}`);
}

export async function getBranchActivityLogs(
  branchId: string,
  filters: { page?: number } = {}
): Promise<ActivityLogsResponse> {
  return api<ActivityLogsResponse>(`/activity-logs/branch/${branchId}${buildQuery(filters)}`);
}

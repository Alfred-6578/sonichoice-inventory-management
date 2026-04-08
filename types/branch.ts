// types/branch.ts

export interface Branch {
  id: string;
  name: string;
  location: string;
  isHQ?: boolean;
  parcels: number;
}

export type StatVariant = "default" | "amber" | "green";

export type ParcelStatus = "transit" | "received" | "pending";


export interface StatItem {
  label: string;
  value: number | string;
  sub: string;
  variant?: StatVariant;
}

export interface SummaryStripProps {
  stats: StatItem[];
}


export interface Parcel {
  id: string;
  desc: string;
  client: string;
  status: ParcelStatus;
}

export interface Staff {
  name: string;
  role: string;
  av: string;
  color: string;
  online: boolean;
}

export interface BranchProduct {
  id: string;
  trackingId: string;
  name: string;
  description: string;
  quantity: number;
  lowStockAlert: number;
  merchantName?: string;
  merchantColor?: string;
}

export interface BranchDetails {
  id: string;
  name: string;
  city: string;
  state: string;
  isHead: boolean;
  address: string;
  phone: string;
  email: string;
  manager: string;
  managerAv: string;
  managerColor: string;
  staff: Staff[];
  holding: number;
  transit: number;
  delivered: number;
  pending: number;
  maxHolding: number;
  parcels: Parcel[];
  products: BranchProduct[];
  color: string;
}
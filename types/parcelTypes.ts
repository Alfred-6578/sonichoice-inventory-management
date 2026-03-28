// types/parcel.ts

export type ParcelStatus = "transit" | "received" | "pending" | "cancelled" | "returned";

export type ParcelSize = "Small" | "Medium" | "Large" | "XL";

export interface Client {
  name: string;
  initials?: string;
  location: string;
  avatarColor: string;
}

export interface ParcelTabsProps {
  incoming: ParcelItem[];
  outgoing: ParcelItem[];
}

export interface ParcelItem {
  id: string;
  client: Client;

  location: string; 

  size: ParcelSize;
  status: ParcelStatus;

  action?: string; 
}

export interface ParcelSectionData {
  incoming: ParcelItem[];
  outgoing: ParcelItem[];
}

export type Filters = {
  status: "all" | "transit" | "pending" | "received" | "cancelled" | "returned";
  search?: string;
  branch?: string;
  merchant?: string;
};

export type HistoryItem = {
  action: string;
  branch: string;
  date: string;
  done: boolean;
};

export type ParcelProductItem = {
  productId: string;
  productName: string;
  trackingId: string;
  description: string;
  quantity: number;
  merchantId?: string;
  merchantName?: string;
  merchantColor?: string;
};

export type ParcelMerchant = {
  name: string;
  initials: string;
  color: string;
};

export type Parcel = {
  id: string;
  apiId: string;
  desc: string;
  size: string;
  weight?: string;
  from: string;
  to: string;
  current: string;
  status: ParcelStatus;
  date: string;
  notes?: string;
  client: string;
  clientCo?: string;
  clientAv: string;
  clientColor: string;
  recipient: string;
  recipientPhone: string;
  fromBranchId?: string;
  toBranchId?: string;
  currentBranchId?: string;
  merchants?: ParcelMerchant[];
  history?: HistoryItem[];
  items?: ParcelProductItem[];
};

export type DetailPanelProps = {
  parcel: Parcel | null;
  onClose: () => void;
};

export type FormDataProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  parcels?: Parcel[];
  onBulkTransfer?: (parcelIds: string[], toBranch: string) => void;
};
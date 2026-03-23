// types/parcel.ts

export type ParcelStatus = "transit" | "delivered" | "pending" | "cancelled";

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
  status: "all" | "transit" | "pending" | "delivered" | "cancelled";
  search?: string;
  branch?: string;
  size?: string;
  category?: string;
  merchant?: string;
};

export type HistoryItem = {
  action: string;
  branch: string;
  date: string;
  done: boolean;
};

export type Parcel = {
  id: string;
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
  history?: HistoryItem[];
};

export type DetailPanelProps = {
  parcel: Parcel | null;
  onClose: () => void;
};

export type FormDataProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
};

export type FormData = {
  client: string;
  desc: string;
  size: string;
  weight: string;
  from: string;
  to: string;
  recipient: string;
  recipientPhone: string;
  date: string;
  notes: string;
};
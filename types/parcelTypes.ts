// types/parcel.ts

export type ParcelStatus = "transit" | "delivered" | "pending";

export type ParcelSize = "Small" | "Medium" | "Large" | "XL";

export interface Client {
  name: string;
  initials?: string;
  location: string;
  avatarColor: string;
}

export interface ParcelTabsProps {
  incoming: Parcel[];
  outgoing: Parcel[];
}

export interface Parcel {
  id: string;
  client: Client;

  // dynamic meaning based on context
  location: string; // "From" OR "Destination"

  size: ParcelSize;
  status: ParcelStatus;
  fee: string;

  action?: string; // optional (Receive, Dispatch, Track)
}

export interface ParcelSectionData {
  incoming: Parcel[];
  outgoing: Parcel[];
}
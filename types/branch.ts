// types/branch.ts

export interface Branch {
  id: string;
  name: string;
  location: string;
  isHQ?: boolean;
  parcels: number;
}
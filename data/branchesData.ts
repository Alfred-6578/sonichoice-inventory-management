// data/branches.ts

import { Branch, BranchDetails, Staff, Parcel } from "@/types/branch";

export const branches: Branch[] = [
  { id: "1", name: "Enugu Head Office", location: "Enugu", isHQ: true, parcels: 8 },
  { id: "2", name: "Nsukka Branch", location: "Nsukka", parcels: 3 },
  { id: "3", name: "Ebonyi Branch", location: "Ebonyi", parcels: 4 },
];

const staffData: Staff[][] = [
  [
    { name: "Taiwo Adeyemi", role: "Branch Manager", av: "TA", color: "#2563eb", online: true },
    { name: "Chidi Nwosu", role: "Senior Staff", av: "CN", color: "#7c3aed", online: true },
    { name: "Amaka Eze", role: "Staff", av: "AE", color: "#059669", online: false },
  ],
  [
    { name: "Emeka Okafor", role: "Branch Manager", av: "EO", color: "#059669", online: true },
    { name: "Fatima Aliyu", role: "Staff", av: "FA", color: "#dc2626", online: true },
  ],
  [
    { name: "Sandra Obi", role: "Branch Manager", av: "SO", color: "#7c3aed", online: false },
    { name: "Kingsley Eze", role: "Staff", av: "KE", color: "#dc2626", online: true },
  ],
];

const parcelsData: Parcel[][] = [
  [
    { id: "PCL-009", desc: "Clothing bales", client: "Kemi Adeyemi", status: "transit" },
    { id: "PCL-005", desc: "Fabric rolls (6)", client: "Kemi Adeyemi", status: "delivered" },
    { id: "PCL-003", desc: "Books & stationery", client: "Tunde Bakare", status: "delivered" },
  ],
  [
    { id: "PCL-008", desc: "Monitor screens x3", client: "Ngozi Eze", status: "transit" },
    { id: "PCL-001", desc: "Clothing bales (batch 1)", client: "Kemi Adeyemi", status: "delivered" },
  ],
  [
    { id: "PCL-006", desc: "Agricultural documents", client: "Aliyu Musa", status: "pending" },
    { id: "PCL-004", desc: "Laptop x2", client: "Ngozi Eze", status: "delivered" },
  ],
];

export const BranchesDetails: BranchDetails[] = branches.map((branch) => ({
  id: branch.id,
  name: branch.name,
  city: branch.location,
  state: `${branch.location} State`,
  isHead: !!branch.isHQ,
  address: `123 ${branch.location} Commerce Blvd, ${branch.location}`,
  phone: "000-000-0000",
  email: `${branch.location.toLowerCase()}@swiftlog.ng`,
  manager: "TBD",
  managerAv: "TBD",
  managerColor: "#374151",
  staff: staffData[parseInt(branch.id) - 1],
  holding: branch.parcels,
  transit: 0,
  delivered: 0,
  pending: 0,
  maxHolding: 10,
  parcels: parcelsData[parseInt(branch.id) - 1],
  color: "#374151",
}));

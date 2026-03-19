// data/parcelData.ts

import { ParcelSectionData } from "@/types/parcelTypes";


export const parcelData: ParcelSectionData = {
  incoming: [
    {
      id: "PCL-009",
      client: {
        name: "Kemi Adeyemi",
        location: "Enugu",
        avatarColor: "#2563eb",
      },
      location: "Enugu HQ",
      size: "Large",
      status: "transit",
      fee: "₦6,200",
      action: "Receive",
    },
    {
      id: "PCL-008",
      client: {
        name: "Ngozi Eze",
        location: "Nsukka",
        avatarColor: "#7c3aed",
      },
      location: "Nsukka Branch",
      size: "Medium",
      status: "transit",
      fee: "₦7,500",
      action: "Receive",
    },
    {
      id: "PCL-006",
      client: {
        name: "Aliyu Musa",
        location: "Ebonyi",
        avatarColor: "#dc2626",
      },
      location: "Ebonyi Branch",
      size: "Small",
      status: "pending",
      fee: "₦1,200",
      action: "Receive",
    },
    {
      id: "PCL-004",
      client: {
        name: "Ngozi Eze",
        location: "Enugu",
        avatarColor: "#7c3aed",
      },
      location: "Enugu HQ",
      size: "Medium",
      status: "delivered",
      fee: "₦5,000",
    },
  ],

  outgoing: [
    {
      id: "PCL-007",
      client: {
        name: "Tunde Bakare",
        location: "Nsukka",
        avatarColor: "#059669",
      },
      location: "Nsukka Branch",
      size: "Small",
      status: "pending",
      fee: "₦1,800",
      action: "Dispatch",
    },
    {
      id: "PCL-005",
      client: {
        name: "Kemi Adeyemi",
        location: "Ebonyi",
        avatarColor: "#2563eb",
      },
      location: "Ebonyi Branch",
      size: "XL",
      status: "delivered",
      fee: "₦6,200",
    },
    {
      id: "PCL-003",
      client: {
        name: "Tunde Bakare",
        location: "Enugu",
        avatarColor: "#059669",
      },
      location: "Enugu HQ",
      size: "Small",
      status: "transit",
      fee: "₦1,800",
      action: "Track",
    },
    {
      id: "PCL-002",
      client: {
        name: "Ngozi Eze",
        location: "Nsukka",
        avatarColor: "#7c3aed",
      },
      location: "Nsukka Branch",
      size: "Medium",
      status: "delivered",
      fee: "₦5,000",
    },
    {
      id: "PCL-001",
      client: {
        name: "Kemi Adeyemi",
        location: "Ebonyi",
        avatarColor: "#2563eb",
      },
      location: "Ebonyi Branch",
      size: "Large",
      status: "delivered",
      fee: "₦3,500",
    },
  ],
};
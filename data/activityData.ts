// data/activity.ts

import { Activity } from "@/types/activity";

export const activities: Activity[] = [
  {
    id: "1",
    type: "transit",
    title: "PCL-009 dispatched to Abuja",
    meta: "Kemi Adeyemi · Lagos HQ",
    time: "2m",
  },
  {
    id: "2",
    type: "delivered",
    title: "PCL-005 delivered",
    meta: "Kemi Adeyemi · Port Harcourt",
    time: "1h",
  },
  {
    id: "3",
    type: "new",
    title: "PCL-008 logged at PH Branch",
    meta: "Ngozi Eze · ₦7,500",
    time: "3h",
  },
  {
    id: "4",
    type: "movement",
    title: "PCL-007 moved to Kano",
    meta: "In transit · Tunde Bakare",
    time: "5h",
  },
];
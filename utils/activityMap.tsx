// utils/activityMap.ts

import { ActivityType } from "@/types/activity";
import { JSX } from "react";

export const activityStyles: Record<
  ActivityType,
  { bg: string; color: string; icon: JSX.Element }
> = {
  transit: {
    bg: "bg-[#fff9eb]",
    color: "text-[#d97706]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09C6.04 10.33 6 10.66 6 11v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81C7.85 19.79 9.78 21 12 21s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z" />
      </svg>
    ),
  },
  delivered: {
    bg: "bg-[#f0fdf4]",
    color: "text-[#16a34a]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12-1.41-1.42z" />
      </svg>
    ),
  },
  new: {
    bg: "bg-[#f4f5f7]",
    color: "text-[#6b7280]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    ),
  },
  movement: {
    bg: "bg-[#eff6ff]",
    color: "text-[#1d4ed8]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
      </svg>
    ),
  },
};
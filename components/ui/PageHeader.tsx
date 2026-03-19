"use client";

import { DM_Mono, Syne } from "next/font/google";
import Button from "./Button";


const syne = Syne({
    variable: "--font-syne",
    subsets: ["latin"]
})

const dm_mono = DM_Mono({
    variable: "--font-dm_mono",
    subsets: ['latin'],
    weight: ["300","400","500"]
})

export default function PageHeader({
  userName = "Emeka",
  branch = "Abuja Branch",
  transitCount = 0,
  pendingCount = 0,
  onLogParcel,
  onOpenBranch,
}:{
    userName: string,
    branch: string,
    transitCount: number,
    pendingCount: number,
    onLogParcel: ()=> void,
    onOpenBranch: ()=> void
}) {
  const now = new Date();

  // Dynamic greeting (UX fix)
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 18 ? "Good afternoon" :
    "Good evening";

  const day = now.toLocaleDateString(undefined, {
    weekday: "long",
  });

  // Better plural handling (UX polish)
  const transitText =
    transitCount === 1
      ? "1 parcel in transit"
      : `${transitCount} parcels in transit`;

  const pendingText =
    pendingCount === 1
      ? "1 pending dispatch"
      : `${pendingCount} pending dispatch`;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      {/* LEFT */}
      <div className="min-w-0">
        <div className={`text-xs text-[#9ca3af] mb-1 truncate uppercase ${dm_mono.className}`}>
          {day} · {branch} branch
        </div>

        <h1 className={`text-2xl font-bold text-[#111827] truncate ${syne.className}`}>
          {greeting}, {userName}
        </h1>

        <p className="text-sm text-[#6b7280] mt-1">
          {transitText} · {pendingText}
        </p>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* MY BRANCH */}

        <Button
            size="sm"
            variant="secondary"
        >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#6b7280]">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            My Branch
        </Button>
        <Button
            size="sm"
        >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Log Parcel
        </Button>

      </div>
    </div>
  );
}
import { useState } from "react";
import ParcelTable from "./ParcelTable";
import { Parcel, ParcelTabsProps } from "@/types/parcelTypes";


export default function ParcelTabs({ incoming, outgoing }: ParcelTabsProps) {
  const [tab, setTab] = useState("incoming");

  return (
    <>
      {/* TABS */}
      <div className="flex border-b border-[#e4e7ec]">
        <button
          onClick={() => setTab("incoming")}
          className={`px-4 py-2 text-sm flex items-center gap-2 ${
            tab === "incoming"
              ? "border-[#111827] border-b-2 text-[#111827]"
              : "text-[#6b7280]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          Incoming
        </button>

        <button
          onClick={() => setTab("outgoing")}
          className={`px-4 py-2 text-sm flex items-center gap-2  ${
            tab === "outgoing"
              ? "border-[#111827] border-b-2 text-[#111827]"
              : "text-[#6b7280]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
          Outgoing
        </button>
      </div>

      {/* CONTENT */}
      <div className="mt-2">
        {tab === "incoming" ? (
          <ParcelTable type="incoming" data={incoming} />
        ) : (
          <ParcelTable type="outgoing" data={outgoing} />
        )}
      </div>
    </>
  );
}
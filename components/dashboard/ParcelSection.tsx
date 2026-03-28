import Link from "next/link";
import ParcelTabs from "./ParcelTabs";
import { ParcelSectionData } from "@/types/parcelTypes";

interface ParcelSectionProps {
  data: ParcelSectionData;
  onParcelClick?: (parcel: any) => void;
}

export default function ParcelSection({ data, onParcelClick }: ParcelSectionProps) {
  const { incoming, outgoing } = data;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase text-[#9ca3af]">
          Parcel Movement
        </span>

        <Link href={'/parcels'} className="text-sm text-[#6b7280] flex items-center gap-1 hover:text-[#111827]">
          View all 
           <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </Link>
      </div>

      {/* CARD */}
      <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
        <ParcelTabs incoming={incoming} outgoing={outgoing} onParcelClick={onParcelClick} />
      </div>
    </div>
  );
}
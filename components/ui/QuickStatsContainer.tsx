import QuickStatCard from "./QuickStatCard";
import { ReactNode } from "react";

export interface QuickStatCardProps {
  value: string | number;
  label: string;
  tone?: "amber" | "green" | "neutral";
  icon: ReactNode;
}

export interface QuickStatsContainerProps{
    data: QuickStatCardProps[]
}

export default function QuickStats({ data }:QuickStatsContainerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">

      {data.map((item, i) => (
        <div
          key={i}
          className={`${
            i !== data.length - 1
              ? "border-b md:border-b-0 md:border-r border-[#e4e7ec]"
              : ""
          }`}
        >
          <QuickStatCard {...item} />
        </div>
      ))}

    </div>
  );
}
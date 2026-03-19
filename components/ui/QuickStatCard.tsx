import { ReactNode } from "react";

interface QuickStatCardProps {
  value: string | number;
  label: string;
  tone?: "amber" | "green" | "neutral";
  icon: ReactNode;
}

export default function QuickStatCard({
     value,
     label,
     tone = "neutral",
     icon,
}: QuickStatCardProps) {
  const toneStyles = {
    amber: "bg-[#fff9eb] text-[#d97706]",
    green: "bg-[#f0fdf4] text-[#16a34a]",
    neutral: "bg-[#f4f5f7] text-[#6b7280] border border-[#e4e7ec]",
  };

  return (
    <div className="flex items-center gap-3 p-4">

      {/* ICON */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toneStyles[tone]}`}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          {icon}
        </svg>
      </div>

      {/* TEXT */}
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-[#111827] leading-none">
          {value}
        </div>
        <div className="text-sm text-[#9ca3af] mt-1 truncate">
          {label}
        </div>
      </div>
    </div>
  );
}
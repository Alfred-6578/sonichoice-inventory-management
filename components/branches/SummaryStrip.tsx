import { SummaryStripProps } from "@/types/branch";
import { DM_Mono, Syne } from "next/font/google";

const syne = Syne({
    variable:"--font-syne",
    subsets:["latin"]
})

const dm_mono = DM_Mono({
    variable: "--font-dm_mono",
    weight:["300","400","500"],
    subsets: ["latin"]
})

export default function SummaryStrip({ stats }: SummaryStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-surface-raised border-b border-[0.5px] rounded-lg border-border">
      {stats.map((item, index) => (
        <div
          key={index}
          className={`p-[14px_14px] tny:p-[14px_20px] border-r border-[0.5px] border-border ${
            index === stats.length - 1 ? "border-r-0" : ""
          }`}
        >
          <div className={`font-m text-[10px] text-ink-subtle uppercase tracking-[0.8px] mb-[4px] ${dm_mono.className}`}>
            {item.label}
          </div>

          <div
            className={`font-d text-[28px] font-bold leading-none tracking-[-0.3px] ${
              item.variant === "amber"
                ? "text-amber-d"
                : item.variant === "green"
                ? "text-delivered"
                : "text-ink"    
            }
            ${syne.className}
            `}
          >
            {item.value}
          </div>

          <div className="text-xs text-ink-subtle mt-[3px]">
            {item.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
import { Syne } from "next/font/google";

const syne = Syne({
    variable:"--font-syne",
    subsets:["latin"]
})

export default function Metric({ label, value, sub, variant, small }: any) {
  return (
    <div className={`p-[14px_16px] border-r border-[0.5px] border-border even:border-r-0 nth-[3]:border-t nth-[4]:border-t ${syne.className}`}>
      <div className="text-[9px] font-m text-ink-subtle uppercase mb-[6px]">
        {label}
      </div>
      <div
        className={`font-d font-bold leading-none ${
          small ? "text-[18px]" : "text-[24px]"
        } ${
          variant === "amber"
            ? "text-amber-d"
            : variant === "green"
            ? "text-delivered"
            : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] text-ink-subtle mt-[3px]">{sub}</div>
    </div>
  );
}
import { DM_Mono, Syne } from "next/font/google";


const syne = Syne({
    variable: "--font-syne",
    subsets: ["latin"]
})

const dm_mono = DM_Mono({
    variable: "--font-dm_mono",
    subsets:["latin"],
    weight:["300","400","500"]
})

export default function MetricCard({
  label,
  value,
  sub,
  delta,
  tone = "green", // amber | green | neutral | dark
}:{
    label: string,
    value: number | string,
    sub: string,
    delta: {
      type: "positive" | "negative" | "neutral";
      value: string;
    },
    tone: "amber" | "green" | "neutral" | "dark"
}) {
  // Top border color
  const toneStyles = {
    amber: "before:bg-[#f59e0b]",
    green: "before:bg-[#16a34a]",
    dark: "before:bg-[#111827]",
    neutral: "before:bg-[#d1d5db]",
  };

  // Value color
  const valueColor = {
    amber: "text-[#d97706]",
    green: "text-[#16a34a]",
    default: "text-[#111827]",
    dark: "text-[#111827]",
    neutral: "text-[#111827]",
  };

  // Delta styles
  const deltaStyles: Record<"positive" | "negative" | "neutral", string> = {
    positive: "bg-[#f0fdf4] text-[#16a34a]",
    negative: "bg-[#fef2f2] text-[#dc2626]",
    neutral: "bg-[#f4f5f7] text-[#9ca3af]",
  };

  return (
    <div
      className={`relative bg-white border border-[#e4e7ec] rounded-xl p-4 overflow-hidden hover:shadow-sm transition
      before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px]
      ${toneStyles[tone]}`}
    >
      {/* LABEL */}
      <div className={`text-xs text-[#9ca3af] uppercase tracking-wide mb-2 ${dm_mono.className}`}>
        {label}
      </div>

      {/* VALUE */}
      <div
        className={`font-semibold text-3xl md:text-4xl leading-none mb-2 ${syne.className} ${valueColor[tone]}`}
      >
        {value}
      </div>

      {/* FOOT */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#9ca3af]">{sub}</span>

        <span
          className={`text-[10px] px-2 py-[2px] rounded ${deltaStyles[delta.type]}`}
        >
          {delta.value}
        </span>
      </div>
    </div>
  );
}
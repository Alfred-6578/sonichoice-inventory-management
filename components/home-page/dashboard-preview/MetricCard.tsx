
export default function MetricCard({
  label,
  value,
  delta,
  color,
  bg
}: {
  label: string
  value: string
  delta: string
  color: string
  bg:string
}) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 vsm:p-5 text-center relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${bg}`}></div>
      <div className="text-xs text-slate-400 tracking-wider mb-2">
        {label}
      </div>

      <div className={`text-2xl md:text-3xl font-bold ${color}`}>
        {value}
      </div>

      <div className="text-xs text-slate-500 mt-1">
        {delta}
      </div>

    </div>
  );
}
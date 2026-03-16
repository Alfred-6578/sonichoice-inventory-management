import StatusBadge from "@/components/ui/StatutsBadge";

export default function TableRow({
  id,
  name,
  initials,
  color,
  status,
  fee
}: any) {
  return (
    <div className="grid grid-cols-4 items-center gap-1 text-slate-300 py-2 overflow-scroll">

      <span className="text-slate-400">{id}</span>

      <div className="flex items-center max-vsm:justify-center gap-3">
        <div className={`w-7 h-7 ${color} rounded-md flex items-center justify-center text-xs font-semibold`}>
          {initials}
        </div>
        <span className="max-vsm:hidden">{name}</span>
      </div>

        <div className="flex justify-center">
          <StatusBadge status={status} />
        </div>

      <span className="text-slate-300">{fee}</span>

    </div>
  );
}
export default function StatusBadge({ status }: { status: string }) {

  const styles: any = {
    Transit: "bg-amber-500/20 text-amber-400",
    Pending: "bg-slate-700 text-slate-400",
    Delivered: "bg-emerald-500/20 text-emerald-400"
  }

  return (
    <span className={`px-3 py-1 text-xs rounded-md w-fit ${styles[status]}`}>
      ● 
      <span className="max-tny:hidden ml-2">{status}</span>
    </span>
  );
}
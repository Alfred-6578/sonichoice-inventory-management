export default function StatusBadge({ status, preview = false }: { status: string, preview?: boolean }) {

  const styles: any = {
    // Parcel statuses
    Transit: "bg-amber-500/20 text-amber-400",
    transit: "bg-amber-500/20 text-amber-400",
    Pending: "bg-slate-700 text-slate-400",
    pending: "bg-slate-700 text-slate-400",
    Delivered: "bg-emerald-500/20 text-emerald-400",
    delivered: "bg-emerald-500/20 text-emerald-400",
    Received: "bg-emerald-500/20 text-emerald-400",
    received: "bg-emerald-500/20 text-emerald-400",
    Cancelled: "bg-red-500/20 text-red-400",
    cancelled: "bg-red-500/20 text-red-400",
    Returned: "bg-orange-500/20 text-orange-400",
    returned: "bg-orange-500/20 text-orange-400",
    // Merchant statuses
    active: "bg-emerald-500/20 text-emerald-400",
    inactive: "bg-slate-700 text-slate-400",
    suspended: "bg-red-500/20 text-red-400"
  }

  return (
    <span className={`px-3 py-1 text-xs rounded-md w-fit capitalize mr-2 ${styles[status] || "bg-slate-700 text-slate-400"}`}>
      ●
      <span className={preview ? "max-tny:hidden" : ""}>{status}</span>
    </span>
  );
}
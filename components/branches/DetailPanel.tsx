import { BranchDetails, ParcelStatus } from "@/types/branch";
import Section from "./Section";
import InfoRow from "./InfoRow";
import Metric from "./Metric";
import { Syne } from "next/font/google";

interface Props {
  branch: BranchDetails | null;
  onClose: () => void;
}

const syne = Syne({
    variable:"--font-syne",
    subsets:["latin"]
})

export default function DetailPanel({ branch, onClose }: Props) {
  if (!branch) return null;

  const getStatusStyles = (status: ParcelStatus) => {
    switch (status) {
      case "transit":
        return {
          wrapper: "bg-transit-bg text-[#92400e] border-transit-border",
          dot: "bg-amber",
          label: "In Transit",
        };
      case "delivered":
        return {
          wrapper: "bg-delivered-bg text-[#14532d] border-delivered-border",
          dot: "bg-delivered",
          label: "Delivered",
        };
      default:
        return {
          wrapper: "bg-surface text-ink-muted border-border",
          dot: "bg-border-strong",
          label: "Pending",
        };
    }
  };

  const formatMoney = (amount: number) =>
    `₦${amount.toLocaleString()}`;

  return (
    <div className="sm:w-[380px] w-full bg-surface-raised border-l border-[0.5px] border-border flex flex-col fixed top-0 z-50 right-0">
      {/* HEADER */}
      <div className="p-[14px_18px] border-b border-[0.5px] border-border flex items-center gap-[10px]">
        <button
          onClick={onClose}
          className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-ink-subtle hover:bg-surface transition"
        >
          ✕
        </button>

        <div>
          <div className="text-[9px] font-m text-ink-subtle uppercase tracking-[0.8px]">
            {branch.isHead ? "Head Office" : "Branch"}
          </div>
          <div className={`font-d text-[15px] font-bold text-ink ${syne.className}`}>
            {branch.name}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        {/* METRICS */}
        <div className="grid grid-cols-2 border-b border-[0.5px] border-border">
          <Metric label="Holding" value={branch.holding} sub="parcels on-site" />
          <Metric label="In Transit" value={branch.transit} sub="moving now" variant="amber" />
          <Metric label="Delivered" value={branch.delivered} sub="this month" variant="green" />
          <Metric
            label="Revenue"
            value={formatMoney(branch.revenue)}
            sub="this month"
            small
          />
        </div>

        {/* INFO */}
        <Section title="Branch Info">
          <InfoRow label="City" value={`${branch.city}, ${branch.state}`} />
          <InfoRow label="Address" value={branch.address} />
          <InfoRow label="Phone" value={branch.phone} mono />
          <InfoRow label="Email" value={branch.email} mono />
          <InfoRow label="Manager" value={branch.manager} />
          <InfoRow label="Type" value={branch.isHead ? "Head Office" : "Branch"} />
        </Section>

        {/* STAFF */}
        <Section title={`Staff (${branch.staff.length})`}>
          {branch.staff.map((s, i) => (
            <div key={i} className="flex items-center gap-[10px] py-[9px] border-b border-[0.5px] border-border last:border-b-0">
              <div
                className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-white font-d text-[11px]"
                style={{ background: s.color }}
              >
                {s.av}
              </div>

              <div>
                <div className="text-[13px] text-ink">{s.name}</div>
                <div className="text-[11px] text-ink-subtle font-m">{s.role}</div>
              </div>

              <span
                className={`ml-auto text-[9px] px-[7px] py-[2px] rounded-[4px] font-m border ${
                  s.online
                    ? "bg-delivered-bg text-delivered border-delivered-border"
                    : "bg-surface text-ink-subtle border-border"
                }`}
              >
                {s.online ? "Online" : "Offline"}
              </span>
            </div>
          ))}
        </Section>

        {/* PARCELS */}
        <Section title={`Current Parcels (${branch.parcels.length})`}>
          {branch.parcels.length === 0 ? (
            <div className="text-[13px] text-ink-subtle">
              No parcels currently at this branch.
            </div>
          ) : (
            branch.parcels.map((p) => {
              const st = getStatusStyles(p.status);

              return (
                <div key={p.id} className="flex items-center gap-[10px] py-[10px] border-b border-[0.5px] border-border last:border-b-0">
                  <span className="font-m text-[10px] px-[7px] py-[2px] rounded-[4px] bg-surface border border-border text-ink-subtle">
                    {p.id}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-ink truncate">
                      {p.desc}
                    </div>
                    <div className="text-[11px] text-ink-subtle">
                      {p.client}
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-[4px] text-[10px] font-m border ${st.wrapper}`}>
                    <span className={`w-[4px] h-[4px] rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
              );
            })
          )}
        </Section>
      </div>
    </div>
  );
}
import { BranchDetails, ParcelStatus } from "@/types/branch";
import { DM_Mono, Syne } from "next/font/google";

interface Props {
  branch: BranchDetails;
  selectedId?: string | null;
  onSelect?: React.Dispatch<React.SetStateAction<string | null>>;
}

const syne = Syne({
    variable:"--font-syne",
    subsets:["latin"]
})

const dm_mono = DM_Mono({
    variable: "--font-dm_mono",
    weight:["300","400","500"],
    subsets: ["latin"]
})


export default function BranchCard({ branch, selectedId, onSelect }: Props) {
  const pct = Math.round((branch.holding / branch.maxHolding) * 100);

  const fillColor =
    pct >= 75
      ? "bg-cancelled"
      : pct >= 50
      ? "bg-amber"
      : "bg-delivered";

  const isLow = branch.holding <= 1 && !branch.isHead;
  const isSelected = selectedId === branch.id;

  const visibleParcels = branch.parcels.slice(0, 2);
  const remaining = branch.parcels.length - 2;

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

  return (
    <div
      onClick={() => onSelect?.(branch.id)}
      className={`bg-surface-raised border border-[0.5px] rounded-[12px] overflow-hidden cursor-pointer transition-all duration-150
      hover:shadow-[0_4px_16px_rgba(17,24,39,0.07)] hover:border-border-strong
      ${branch.isHead ? "border-amber border-[1px]" : "border-border"}
      ${isSelected ? "border-ink shadow-[0_0_0_2px_rgba(17,24,39,0.08)]" : ""}
      `}
    >
      {/* HEADER */}
      <div className={`p-[14px_16px] flex justify-between border-b border-[0.5px] border-border ${syne.className}`}>
        <div>
          <div className="font-d text-[16px] font-bold text-ink mb-[3px]">
            {branch.name}
          </div>

          <div className="flex items-center gap-[6px] text-[12px] text-ink-subtle font-m">
            <span
              className={`w-[6px] h-[6px] rounded-full ${
                branch.isHead ? "bg-amber" : "bg-delivered"
              }`}
            />
            {branch.city} · {branch.state}
          </div>
        </div>

        <div className="flex gap-[6px] items-center">
          {branch.isHead && (
            <span className="text-[9px] font-m px-[8px] py-[3px] rounded-[4px] bg-amber-muted text-amber-d border border-amber-border">
              HQ
            </span>
          )}

          {isLow ? (
            <span className="text-[9px] font-m px-[8px] py-[3px] rounded-[4px] bg-danger-bg text-danger border border-danger-border">
              Low volume
            </span>
          ) : (
            <span className="text-[9px] font-m px-[8px] py-[3px] rounded-[4px] bg-delivered-bg text-delivered border border-delivered-border">
              Active
            </span>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3">
        <div className="p-[12px_14px] text-center border-r border-[0.5px] border-border">
          <div className="font-d text-[20px] font-bold text-ink">
            {branch.holding}
          </div>
          <div className="text-[9px] font-m text-ink-subtle uppercase mt-[3px]">
            Holding
          </div>
        </div>

        <div className="p-[12px_14px] text-center border-r border-[0.5px] border-border">
          <div className="font-d text-[20px] font-bold text-amber-d">
            {branch.transit}
          </div>
          <div className="text-[9px] font-m text-ink-subtle uppercase mt-[3px]">
            In Transit
          </div>
        </div>

        <div className="p-[12px_14px] text-center">
          <div className="font-d text-[20px] font-bold text-delivered">
            {branch.delivered}
          </div>
          <div className="text-[9px] font-m text-ink-subtle uppercase mt-[3px]">
            Delivered
          </div>
        </div>
      </div>

      {/* CAPACITY */}
      {/* <div className="p-[10px_14px] border-t border-[0.5px] border-border flex items-center gap-[10px]">
        <span className="text-[10px] font-m text-ink-subtle whitespace-nowrap">
          Capacity
        </span>

        <div className="flex-1 h-[4px] bg-border rounded-[2px] overflow-hidden">
          <div
            className={`h-full rounded-[2px] transition-all duration-300 ${fillColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <span className="text-[10px] font-m text-ink-subtle whitespace-nowrap">
          {branch.holding}/{branch.maxHolding}
        </span>
      </div> */}

      {/* PARCELS */}
      {branch.parcels.length > 0 && (
        <div className="border-t border-[0.5px] border-border">
          {visibleParcels.map((p) => {
            const st = getStatusStyles(p.status);

            return (
              <div
                key={p.id}
                className="flex items-center gap-[10px] px-[14px] py-[9px] border-b border-[0.5px] border-border last:border-b-0"
              >
                <span className="font-m text-[10px] px-[6px] py-[2px] rounded-[4px] bg-surface border border-border text-ink-subtle">
                  {p.id}
                </span>

                <span className="text-[12px] text-ink flex-1 truncate">
                  {p.desc}
                </span>

                <span
                  className={`inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-[4px] text-[10px] font-m border ${st.wrapper}`}
                >
                  <span className={`w-[4px] h-[4px] rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </div>
            );
          })}

          {remaining > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(branch.id);
              }}
              className="w-full text-left px-[14px] py-[8px] text-[10px] font-m text-ink-subtle hover:text-ink transition-colors"
            >
              + {remaining} more parcel{remaining > 1 ? "s" : ""} — view all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
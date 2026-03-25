"use client";

import { FormDataProps } from "@/types/parcelTypes";
import { useMemo, useState } from "react";
import Select from "../ui/Select";
import { DM_Mono, Syne } from "next/font/google";
import StatusBadge from "../ui/StatusBadge";
import Tag from "../ui/Tag";

const dm_mono = DM_Mono({
    variable:"--font-dm_mono",
    subsets:["latin"],
    weight: ["300","400","500"]
})

const syne = Syne({
    variable: "--font-syne",
    subsets:["latin"]
})

const BRANCH_OPTIONS = [
  { value: "Enugu (Head Office)", label: "Enugu (Head Office)" },
  { value: "Nsukka", label: "Nsukka" },
  { value: "Ebonyi", label: "Ebonyi" },
];

export default function ParcelFormPanel({
  isOpen,
  onClose,
  parcels = [],
  onBulkTransfer,
}: FormDataProps) {
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Parcels available for transfer: at the selected source branch, not delivered/cancelled
  const transferableParcels = useMemo(() => {
    if (!fromBranch) return [];
    return parcels.filter(
      (p) =>
        p.current === fromBranch &&
        (p.status === "transit" || p.status === "pending")
    );
  }, [parcels, fromBranch]);

  // When source branch changes, reset selections
  const handleFromBranchChange = (branch: string) => {
    setFromBranch(branch);
    setSelectedIds(new Set());
  };

  const toggleParcel = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === transferableParcels.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transferableParcels.map((p) => p.id)));
    }
  };

  const handleBulkTransfer = () => {
    if (selectedIds.size === 0 || !toBranch) return;
    onBulkTransfer?.(Array.from(selectedIds), toBranch);
    setSelectedIds(new Set());
    setFromBranch("");
    setToBranch("");
    onClose();
  };

  // Destination options exclude the source branch
  const destinationOptions = BRANCH_OPTIONS.filter(
    (b) => b.value !== fromBranch
  );

  const resetAndClose = () => {
    onClose();
    setSelectedIds(new Set());
    setFromBranch("");
    setToBranch("");
  };

  return (
    <div
      className={`fixed top-0 right-0 bottom-0 z-[60] w-full sm:max-w-[460px]
      bg-surface-raised border-l border-border flex flex-col
      transition-transform duration-300
      ${isOpen ? "translate-x-0" : "translate-x-full"}
    `}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div>
          <div className={`text-[11px] font-mono text-ink-subtle uppercase tracking-wider mb-1 ${dm_mono.className}`}>
            Parcels
          </div>
          <div className={`text-lg font-bold text-ink ${syne.className}`}>
            Log Parcels
          </div>
        </div>

        <button
          onClick={resetAndClose}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* SOURCE BRANCH */}
        <Field label="From Branch">
          <Select
            id="transfer-from"
            size="sm"
            value={fromBranch}
            onChange={(e) => handleFromBranchChange(e.target.value)}
            options={BRANCH_OPTIONS}
            placeholder="— Select source branch —"
          />
        </Field>

        {/* DESTINATION BRANCH */}
        <Field label="To Branch">
          <Select
            id="transfer-to"
            size="sm"
            value={toBranch}
            onChange={(e) => setToBranch(e.target.value)}
            options={destinationOptions}
            placeholder="— Select destination —"
          />
        </Field>

        <Divider label="Select Parcels" />

        {/* PARCEL SELECTION LIST */}
        {!fromBranch ? (
          <div className="text-center py-8 text-ink-muted text-sm">
            Select a source branch to see available parcels
          </div>
        ) : transferableParcels.length === 0 ? (
          <div className="text-center py-8 text-ink-muted text-sm">
            No transferable parcels at this branch
          </div>
        ) : (
          <div className="space-y-2">
            {/* SELECT ALL */}
            <button
              onClick={toggleAll}
              className={`w-full text-left text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-lg border transition-colors ${
                selectedIds.size === transferableParcels.length
                  ? "bg-amber/10 border-amber text-amber-700"
                  : "border-border text-ink-muted hover:bg-surface"
              }`}
            >
              {selectedIds.size === transferableParcels.length
                ? `Deselect all (${transferableParcels.length})`
                : `Select all (${transferableParcels.length})`}
            </button>

            {/* PARCEL CARDS */}
            {transferableParcels.map((p) => (
              <label
                key={p.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedIds.has(p.id)
                    ? "bg-amber/5 border-amber"
                    : "border-border hover:bg-surface"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleParcel(p.id)}
                  className="mt-1 accent-amber-600 w-4 h-4"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag label={p.id} />
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-sm font-medium text-ink truncate">
                    {p.desc}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {p.client}
                    {p.weight && ` · ${p.weight}`}
                    {` · ${p.size}`}
                  </div>
                  <div className="text-xs text-ink-subtle mt-0.5">
                    {p.from} → {p.to}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-border flex gap-2">
        <button
          onClick={resetAndClose}
          className="px-4 py-2 border border-border rounded-lg text-ink-muted hover:bg-surface"
        >
          Cancel
        </button>

        <button
          onClick={handleBulkTransfer}
          disabled={selectedIds.size === 0 || !toBranch}
          className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
            selectedIds.size > 0 && toBranch
              ? "bg-ink text-white"
              : "bg-ink/30 text-white/60 cursor-not-allowed"
          }`}
        >
          Transfer {selectedIds.size > 0 ? `${selectedIds.size} parcel${selectedIds.size > 1 ? "s" : ""}` : "parcels"}
        </button>
      </div>
    </div>
  );
}

/* REUSABLE FIELD */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`block text-[11px] font-mono text-ink-muted uppercase mb-1 ${dm_mono.className}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* DIVIDER */
function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-4">
      <div className="h-px bg-border" />
      <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-subtle bg-surface-raised uppercase pr-2 ${dm_mono.className}`}>
        {label}
      </span>
    </div>
  );
}

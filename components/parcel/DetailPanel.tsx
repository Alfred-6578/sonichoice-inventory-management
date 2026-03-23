"use client";

import { DetailPanelProps } from "@/types/parcelTypes";
import Row from "./Row";
import Section from "./Section";
import { Syne } from "next/font/google";


const syne = Syne({
    variable: "--font-syne",
    subsets:["latin"]
})


export default function DetailPanel({ parcel, onClose }: DetailPanelProps) {
  const isOpen = !!parcel;

  if (!parcel) {
    return (
      <div className={`w-0 overflow-hidden transition-all`} />
    );
  }

  // progress
  const pct =
    parcel.status === "delivered"
      ? 100
      : parcel.status === "transit"
      ? 60
      : 20;

  const fillClass =
    parcel.status === "delivered" ? "bg-delivered" : "bg-amber";

  return (
    <div
      className={`bg-surface-raised h-screen fixed right-0 top-0 z-50 shadow-2xl border-l border-border flex flex-col transition-all
        ${isOpen ? "sm:w-[380px] w-full" : "w-0 overflow-hidden"}
      `}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <span className="font-mono text-xs bg-surface px-2 py-1 rounded border border-border text-ink-subtle">
          {parcel.id}
        </span>

        <div className="ml-auto flex gap-2">
          {(parcel.status === "transit" ||
            parcel.status === "pending") && (
            <button className="px-2 py-1 border border-border rounded text-xs font-mono text-ink-muted hover:bg-ink hover:text-white">
              Move
            </button>
          )}

          {parcel.status === "transit" && (
            <button className="px-2 py-1 bg-ink text-white rounded text-xs font-mono">
              Deliver
            </button>
          )}
        </div>
      </div>

      

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TITLE */}
        <div>
          <div className={`text-lg font-bold text-ink mb-1 ${syne.className}`}>
            {parcel.desc}
          </div>

          <span className="text-xs font-mono px-2 py-1 rounded border">
            {parcel.status}
          </span>
        </div>

        {/* PROGRESS */}
        <div>
          <div className="flex justify-between text-xs font-mono text-ink-subtle mb-1">
            <span>{parcel.from}</span>
            <span>{parcel.to}</span>
          </div>

          <div className="h-[4px] bg-border rounded overflow-hidden">
            <div
              className={`h-full ${fillClass}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* DETAILS */}
        <Section title="Parcel Details">
          <Row label="Size" value={`${parcel.size}${parcel.weight ? ` · ${parcel.weight}` : ""}`} />
          <Row label="Date received" value={parcel.date} mono />
          <Row label="Current location" value={parcel.current} />

          {parcel.notes && (
            <Row label="Notes" value={parcel.notes} highlight />
          )}
        </Section>

        {/* CLIENT */}
        <Section title="Client">
          <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-md text-white font-bold"
              style={{ background: parcel.clientColor }}
            >
              {parcel.clientAv}
            </div>

            <div>
              <div className="text-ink font-medium">{parcel.client}</div>
              <div className="text-xs text-ink-subtle font-mono">
                {parcel.clientCo || "Individual"}
              </div>
            </div>
          </div>
        </Section>

        {/* RECIPIENT */}
        <Section title="Recipient">
          <Row label="Name" value={parcel.recipient} />
          <Row label="Phone" value={parcel.recipientPhone} mono />
          <Row label="Deliver to" value={parcel.to} />
        </Section>

        {/* TIMELINE */}
        <Section title="Movement History">
          <div className="space-y-4">
            {parcel.history?.map((h, i) => {
              const previousDone = i > 0 ? parcel.history?.[i - 1]?.done : false;
              const isActive = !h.done && (i === 0 || previousDone);

              const dotClass = h.done
                ? "bg-delivered"
                : isActive
                ? "bg-amber"
                : "bg-border-strong";

              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full border ${dotClass}`}
                    />
                    {i !== (parcel.history?.length ?? 0) - 1 && (
                      <div className="w-[1px] flex-1 bg-border mt-1" />
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-ink">{h.action}</div>
                    <div className="text-xs text-ink-subtle font-mono">
                      {h.branch} · {h.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}


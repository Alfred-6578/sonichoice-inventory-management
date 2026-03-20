"use client";

import { FormData, FormDataProps } from "@/types/parcelTypes";
import { useState } from "react";
import Select from "../ui/Select";
import Input from "../ui/Input";
import { DM_Mono, Syne } from "next/font/google";

const dm_mono = DM_Mono({
    variable:"--font-dm_mono",
    subsets:["latin"],
    weight: ["300","400","500"]
})

const syne = Syne({
    variable: "--font-syne",
    subsets:["latin"]
})

export default function ParcelFormPanel({
  isOpen,
  onClose,
  onSubmit,
}: FormDataProps) {
  const [form, setForm] = useState<FormData>({
    client: "",
    desc: "",
    size: "",
    weight: "",
    from: "Enugu (Head Office)",
    to: "",
    recipient: "",
    recipientPhone: "",
    fee: 0,
    date: "",
    notes: "",
  });

  const handleChange = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit?.(form);
    onClose();
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
            New Parcel
          </div>
          <div className={`text-lg font-bold text-ink ${syne.className}`}>
            Log a parcel
          </div>
        </div>

        <button
          onClick={onClose}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-ink-subtle hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* CLIENT */}
        <Field label="Client / Sender">
          <Select
            id="client"
            value={form.client}
            size="sm"
            onChange={(e) => handleChange("client", e.target.value)}
            options={[
              { value: "Kemi Adeyemi (Adeyemi Fashion)", label: "Kemi Adeyemi (Adeyemi Fashion)" },
              { value: "Tunde Bakare", label: "Tunde Bakare" },
              { value: "Ngozi Eze (EzeMart Electronics)", label: "Ngozi Eze (EzeMart Electronics)" },
              { value: "Aliyu Musa (Musa Agro)", label: "Aliyu Musa (Musa Agro)" },
            ]}
            placeholder="— Select client —"
          />
        </Field>

        {/* DESC */}
        <Field label="Parcel Description">
          <Input
            id="desc"
            size="sm"
            value={form.desc}
            onChange={(e) => handleChange("desc", e.target.value)}
            placeholder="e.g. Clothing bales..."
          />
        </Field>

        {/* SIZE + WEIGHT */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size">
            <Select
              id="size"
              size="sm"
              value={form.size}
              onChange={(e) => handleChange("size", e.target.value)}
              options={[
                { value: "Small", label: "Small (0–2kg)" },
                { value: "Medium", label: "Medium (2–10kg)" },
                { value: "Large", label: "Large (10–30kg)" },
                { value: "XL", label: "XL (30kg+)" },
              ]}
              placeholder="Select size"
            />
          </Field>

          <Field label="Weight (optional)">
            <Input
              id="weight"
              size="sm"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="e.g. 5kg"
            />
          </Field>
        </div>

        {/* BRANCHES */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origin Branch">
            <Select
              id="from"
              size="sm"
              value={form.from}
              onChange={(e) => handleChange("from", e.target.value)}
              options={[
                { value: "Enugu (Head Office)", label: "Enugu (Head Office)" },
                { value: "Nsukka", label: "Nsukka" },
                { value: "Ebonyi", label: "Ebonyi" },
              ]}
            />
          </Field>

          <Field label="Destination Branch">
            <Select
              id="to"
              size="sm"
              value={form.to}
              onChange={(e) => handleChange("to", e.target.value)}
              options={[
                { value: "Enugu (Head Office)", label: "Enugu (Head Office)" },
                { value: "Nsukka", label: "Nsukka" },
                { value: "Ebonyi", label: "Ebonyi" },
              ]}
              placeholder="— Select —"
            />
          </Field>
        </div>

        {/* RECIPIENT */}
        <Divider label="Recipient" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Recipient Name">
            <Input
              id="recipient"
              size="sm"
              value={form.recipient}
              onChange={(e) => handleChange("recipient", e.target.value)}
              placeholder="Who receives it"
            />
          </Field>

          <Field label="Recipient Phone">
            <Input
              id="recipientPhone"
              size="sm"
              value={form.recipientPhone}
              onChange={(e) => handleChange("recipientPhone", e.target.value)}
              placeholder="0800-000-0000"
            />
          </Field>
        </div>

        {/* CHARGES */}
        <Divider label="Charges" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Delivery Fee (₦)">
            <Input
              id="fee"
              size="sm"
              type="number"
              value={form.fee}
              onChange={(e) => handleChange("fee", e.target.value)}
            />
          </Field>

          <Field label="Date Received">
            <Input
              id="date"
              size="sm"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </Field>
        </div>

        {/* NOTES */}
        <Field label="Notes (optional)">
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="e.g Fragile, handle with care, Call reciepient before delivery..."
            className="input min-h-[80px] placeholder:text-ink-muted/70 placeholder:text-sm px-4 py-2 border border-border w-full rounded-lg outline-amber"
          />
        </Field>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-border flex gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-lg text-ink-muted hover:bg-surface"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-ink text-white rounded-lg font-bold"
        >
          Log Parcel
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
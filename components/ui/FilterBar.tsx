"use client";
import { useState } from "react";
import { Filters } from "@/types/parcelTypes";

export type FilterConfig = {
  label: string;
  key: string;
  options: { value: string; label: string }[] | null;
  placeholder?: string;
};

export type FilterBarProps = {
  total: number;
  filters: any;
  onChange?: (filters: any) => void;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  filterConfigs?: FilterConfig[];
  branchOptions?: { value: string; label: string }[];
  sizeOptions?: { value: string; label: string }[];
  categoryOptions?: { value: string; label: string }[];
  merchantOptions?: { value: string; label: string }[];
  showStatus?: boolean;
  showSize?: boolean;
  resetKeys?: string[];
  disabled?: boolean;
};

export default function FilterBar({
  total,
  filters,
  setFilters,
  onChange,
  filterConfigs,
  branchOptions,
  sizeOptions,
  categoryOptions,
  merchantOptions,
  showStatus = false,
  showSize = true,
  resetKeys = ["search", "branch", "size", "status"],
  disabled = false,
}: FilterBarProps) {
 

  const handleChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onChange?.(updated);
  };

  const clearFilters = () => {
    const reset: any = {};
    resetKeys.forEach(key => {
      reset[key] = key === "status" ? "all" : "";
    });
    setFilters(reset);
    onChange?.(reset);
  };

  // If filterConfigs provided, use that; otherwise use default parcel config
  const configs: FilterConfig[] = filterConfigs || [
    {
      label: "Branch",
      key: "branch",
      options: branchOptions || [
        { value: "Enugu (Head Office)", label: "Enugu Head Office" },
        { value: "Nsukka", label: "Nsukka Branch" },
        { value: "Ebonyi", label: "Ebonyi Branch" },
      ],
    },
    ...(showSize ? [{
      label: "Size",
      key: "size",
      options: sizeOptions || [
        { value: "Small", label: "Small" },
        { value: "Medium", label: "Medium" },
        { value: "Large", label: "Large" },
        { value: "XL", label: "XL" },
      ],
    }] : []),
    ...(showStatus ? [{
      label: "Status",
      key: "status",
      options: [
        { value: "all", label: "All Status" },
        { value: "transit", label: "Transit" },
        { value: "delivered", label: "Delivered" },
        { value: "pending", label: "Pending" },
        { value: "cancelled", label: "Cancelled" },
      ],
    }] : []),
  ];

  return (
    <div className="flex gap-2 items-center flex-wrap py-1.5 pb-3">
      {/* Search */}
      <div className={`flex items-center gap-2 px-3 py-[7px] bg-surface-raised border border-border rounded-lg flex-1 min-w-[180px] max-w-[280px] focus-within:border-border-strong ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-ink-subtle shrink-0">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>

        <input
          type="text"
          placeholder="Search ID, merchant, description..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          disabled={disabled}
          className="bg-transparent outline-none w-full text-[13px] text-ink placeholder:text-ink-subtle"
        />
      </div>

      {/* Dynamic Filters */}
      {configs.map((config) => (
        <select
          key={config.key}
          value={filters[config.key] || ""}
          onChange={(e) => handleChange(config.key, e.target.value)}
          disabled={disabled}
          className={`px-2.5 py-[7px] bg-surface-raised border border-border rounded-lg text-[13px] text-ink-muted outline-none cursor-pointer focus:border-border-strong ${disabled ? "opacity-50" : ""}`}
        >
          <option value="">All {config.label}</option>
          {config.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-[11px] font-mono text-ink-subtle">
          {total} parcels
        </span>

        <button
          onClick={clearFilters}
          className="text-[11px] font-mono text-amber underline hover:text-amber-hover"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
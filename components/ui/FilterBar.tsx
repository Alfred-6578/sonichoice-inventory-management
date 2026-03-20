"use client";
import { useState } from "react";
import { Filters } from "@/types/parcelTypes";

type FilterBarProps = {
  total: number;
  filters: Filters;
  onChange?: (filters: Filters) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export default function FilterBar({ total, filters, setFilters, onChange }: FilterBarProps) {
 

  const handleChange = (key: keyof Filters, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    console.log(filters);
    
    onChange?.(updated);
  };

  const clearFilters = () => {
    const reset:Filters = { search: "", branch: "", size: "", status: "all" };
    setFilters(reset);
    onChange?.(reset);
  };

  return (
    <div className="flex gap-2 items-center flex-wrap py-1.5 pb-3">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-[7px] bg-surface-raised border border-border rounded-lg flex-1 min-w-[180px] max-w-[280px] focus-within:border-border-strong">
        <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-ink-subtle shrink-0">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>

        <input
          type="text"
          placeholder="Search ID, client, recipient, description..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="bg-transparent outline-none w-full text-[13px] text-ink placeholder:text-ink-subtle"
        />
      </div>

      {/* Branch Filter */}
      <select
        value={filters.branch}
        onChange={(e) => handleChange("branch", e.target.value)}
        className="px-2.5 py-[7px] bg-surface-raised border border-border rounded-lg text-[13px] text-ink-muted outline-none cursor-pointer focus:border-border-strong"
      >
        <option value="">All Branches</option>
        <option value="Enugu (Head Office)">Enugu Head Office</option>
        <option value="Nsukka">Nsukka Branch</option>
        <option value="Ebonyi">Ebonyi Branch</option>
      </select>

      {/* Size Filter */}
      <select
        value={filters.size}
        onChange={(e) => handleChange("size", e.target.value)}
        className="px-2.5 py-[7px] bg-surface-raised border border-border rounded-lg text-[13px] text-ink-muted outline-none cursor-pointer focus:border-border-strong"
      >
        <option value="">All Sizes</option>
        <option>Small</option>
        <option>Medium</option>
        <option>Large</option>
        <option>XL</option>
      </select>

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
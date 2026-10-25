"use client";
import { useEffect, useRef, useState } from "react";
import { Filters } from "@/types/parcelTypes";

export type FilterConfig = {
  label: string;
  key: string;
  options: { value: string; label: string }[] | null;
  placeholder?: string;
  /** Render a searchable combobox instead of a native select. Use for long lists. */
  searchable?: boolean;
  /** Options still loading — shows a placeholder and blocks interaction. */
  loading?: boolean;
};

const TRIGGER_CLASS =
  "px-2.5 py-[7px] bg-surface-raised border border-border rounded-lg text-[13px] text-ink-muted outline-none cursor-pointer focus:border-border-strong";

/* Combobox used for filters with too many options to scan in a native select. */
function SearchableFilter({
  config,
  value,
  onChange,
  disabled,
}: {
  config: FilterConfig;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = config.options || [];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q))
    : options;
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const isDisabled = disabled || !!config.loading;

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((o) => !o)}
        className={`${TRIGGER_CLASS} flex items-center gap-1.5 ${
          isDisabled ? "opacity-50 cursor-not-allowed" : ""
        } ${value ? "text-ink border-border-strong" : ""}`}
      >
        {config.loading ? (
          <>
            <span className="w-3 h-3 rounded-full border-[1.5px] border-ink-subtle border-t-transparent animate-spin" />
            <span>Loading {config.label.toLowerCase()}s...</span>
          </>
        ) : (
          <span>{selectedLabel || `All ${config.label}`}</span>
        )}
        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && !isDisabled && (
        <div className="absolute z-30 mt-1 w-56 bg-surface-raised border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-1.5 border-b border-border">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}...`}
              className="w-full px-2 py-1.5 bg-surface border border-border rounded-md text-[12px] text-ink outline-none focus:border-border-strong placeholder:text-ink-subtle"
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => select("")}
              className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-surface transition ${
                !value ? "text-ink font-medium bg-surface" : "text-ink-muted"
              }`}
            >
              All {config.label}
            </button>

            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-ink-subtle">
                No {config.label.toLowerCase()} matches &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt.value)}
                  className={`w-full text-left px-3 py-1.5 text-[12px] truncate hover:bg-surface transition ${
                    opt.value === value
                      ? "text-amber-700 font-medium bg-amber/5"
                      : "text-ink-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>

          {options.length > 0 && (
            <div className="px-3 py-1.5 border-t border-border text-[10px] font-mono text-ink-subtle">
              {filtered.length} of {options.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
      {configs.map((config) =>
        config.searchable ? (
          <SearchableFilter
            key={config.key}
            config={config}
            value={filters[config.key] || ""}
            onChange={(v) => handleChange(config.key, v)}
            disabled={disabled}
          />
        ) : (
          <select
            key={config.key}
            value={filters[config.key] || ""}
            onChange={(e) => handleChange(config.key, e.target.value)}
            disabled={disabled || !!config.loading}
            className={`${TRIGGER_CLASS} ${disabled || config.loading ? "opacity-50" : ""}`}
          >
            <option value="">
              {config.loading ? `Loading ${config.label.toLowerCase()}s...` : `All ${config.label}`}
            </option>
            {config.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-[11px] font-mono text-ink-subtle">
          {total} parcels
        </span>

        <button
          onClick={clearFilters}
          className="text-[11px] font-mono cursor-pointer text-amber underline hover:text-amber-hover"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
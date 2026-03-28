"use client";
import { useState } from "react";
import StatusPill from "./StatusPill";

export type StatusKey = "all" | "transit" | "pending" | "received" | "cancelled" | "returned";

export type StatusConfig = {
  key: StatusKey;
  label: string;
  dot?: string;
};

export type StatusPillsProps = {
  counts: Record<StatusKey, number>;
  onChange?: (status: StatusKey) => void;
  activeStatus: string;
  disabled?: boolean;
};

const STATUS_CONFIG: StatusConfig[] = [
  { key: "all", label: "All" },
  { key: "transit", label: "In Transit", dot: "bg-amber" },
  { key: "pending", label: "Pending", dot: "bg-border-strong" },
  { key: "received", label: "Received", dot: "bg-delivered" },
  { key: "cancelled", label: "Cancelled", dot: "bg-danger" },
  { key: "returned", label: "Returned", dot: "bg-orange-500" },
];

export default function StatusPillsContainer({
  counts,
  onChange,
  activeStatus,
  disabled = false,
}: StatusPillsProps) {

  const handleClick = (status: StatusKey) => {
    onChange?.(status);
  };

  const getActiveStyles = (key: StatusKey): string => {
    switch (key) {
      case "all":
        return "bg-ink text-white border-ink";
      case "transit":
        return "bg-transit-bg text-amber border-transit-border";
      case "pending":
        return "bg-surface text-ink border-border-strong";
      case "received":
        return "bg-delivered-bg text-green-900 border-delivered-border";
      case "cancelled":
        return "bg-danger-bg text-red-900 border-danger-border";
      case "returned":
        return "bg-orange-50 text-orange-900 border-orange-200";
      default:
        return "";
    }
  };

  return (
    <div className={`flex gap-1.5 py-2.5 flex-wrap ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {STATUS_CONFIG.map((item) => {
        const isActive = activeStatus === item.key;

        return (
          <StatusPill
            key={item.key}
            item={item}
            isActive={isActive}
            count={counts[item.key] ?? 0}
            onClick={handleClick}
            getActiveStyles={getActiveStyles}
          />
        );
      })}
    </div>
  );
}
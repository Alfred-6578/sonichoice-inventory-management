"use client";

import { Branch } from "@/types/branch";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BranchListProps {
  data: Branch[];
}

export default function BranchList({ data }: BranchListProps) {
  const router = useRouter();
  const max = Math.max(...data.map((b) => b.parcels)); 

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wide">
            Branches
          </span>
          <span className="text-[10px] px-2 py-[2px] rounded bg-[#f4f5f7] border border-[#e4e7ec] text-[#6b7280]">
            {data.length}
          </span>
        </div>

        <Link href={'/branches'} className="text-sm text-[#6b7280] flex items-center gap-1 hover:text-[#111827] transition">
          View all
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </Link>
      </div>

      {/* CARD */}
      <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
        {data.map((branch) => {
          const percent = (branch.parcels / max) * 100;

          return (
            <div
              key={branch.id}
              onClick={() => router.push(`/branches?branchId=${branch.id}`)}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#e4e7ec] last:border-none hover:bg-[#f4f5f7] transition cursor-pointer"
            >
              {/* DOT */}
              <div
                className={`w-2 h-2 rounded-full ${
                  branch.isHQ ? "bg-[#f59e0b]" : "bg-[#9ca3af]"
                }`}
              />

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#111827] truncate">
                  {branch.name}
                </div>
                <div className="text-xs text-[#9ca3af] font-mono">
                  {branch.location}
                  {branch.isHQ && " · HQ"}
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <div className="text-lg font-bold text-[#111827] leading-none">
                  {branch.parcels}
                </div>
                <div className="text-[10px] text-[#9ca3af] font-mono">
                  holding
                </div>

                {/* BAR */}
                <div className="w-14 h-[3px] bg-[#e4e7ec] rounded mt-1 ml-auto">
                  <div
                    className="h-full bg-[#111827] rounded"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
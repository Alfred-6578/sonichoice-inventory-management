"use client";

import { Activity } from "@/types/activity";
import { activityStyles } from "@/utils/activityMap";
import Link from "next/link";

interface ActivityListProps {
  data: Activity[];
}

export default function ActivityList({ data }: ActivityListProps) {
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wide">
          Activity
        </span>

        <Link href="/activity" className="text-sm text-[#6b7280] flex items-center gap-1 hover:text-[#111827] transition">
          See more
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </Link>
      </div>

      {/* CARD */}
      <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
        {data.map((item) => {
          const style = activityStyles[item.type];

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 px-4 py-3 border-b border-[#e4e7ec] last:border-none hover:bg-[#f4f5f7] transition cursor-pointer"
            >
              {/* ICON */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${style.bg} ${style.color}`}
              >
                {style.icon}
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#111827] leading-snug">
                  {item.title}
                </div>
                <div className="text-xs text-[#9ca3af] mt-0.5">
                  {item.meta}
                </div>
              </div>

              {/* TIME */}
              <div className="text-[10px] font-mono text-[#9ca3af] mt-1">
                {item.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
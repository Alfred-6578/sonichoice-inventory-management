"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Topbar({ setIsOpen }:{setIsOpen: (isOpen:boolean)=> void}) {
  const [query, setQuery] = useState("");
  const [dateText, setDateText] = useState("");

  useEffect(() => {
    const now = new Date();
    const day = shortWeekdays[now.getDay()];
    const month = shortMonths[now.getMonth()];
    const date = now.getDate();

    setDateText(`${day} ${date} ${month}`);
  }, []);

  return (
    <header className="h-[66px] bg-[#ffffff] fixed w-full lg:w-[calc(100%-250px)] border-b border-[#e4e7ec] flex items-center px-4 gap-3 z-20">

      {/* HAMBURGER (mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-9 h-9 rounded-lg border border-[#e4e7ec] flex items-center justify-center hover:bg-[#f4f5f7] transition"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#6b7280]">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>

      {/* SEARCH BAR */}
      <div className="hidden lg:flex items-center flex-1 max-w-[260px]">
        <div className="flex items-center gap-2 w-full px-3 py-2 bg-[#f4f5f7] border border-[#e4e7ec] rounded-lg focus-within:border-[#d1d5db] transition">

          {/* ICON */}
          <Search className="h-4.5 text-ink-muted/40"/>

          {/* INPUT */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parcels..."
            className="flex-1 bg-transparent outline-none text-sm text-[#111827] placeholder:text-[#9ca3af]"
          />

          {/* SHORTCUT HINT */}
          <kbd className="text-[10px] px-2 py-[2px] rounded bg-[#e4e7ec] text-[#9ca3af] border border-[#d1d5db]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="ml-auto flex items-center gap-2">

        {/* NOTIFICATION BUTTON */}
        <button className="relative w-9 h-9 rounded-lg border border-[#e4e7ec] flex items-center justify-center hover:bg-[#f4f5f7] transition">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#6b7280]">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>

          {/* DOT */}
          <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full bg-[#f59e0b] border-2 border-white" />
        </button>

        {/* DATE CHIP */}
        <div className="hidden lg:block text-[10px] text-[#9ca3af] px-3 py-1.5 bg-[#f4f5f7] border border-[#e4e7ec] rounded-md whitespace-nowrap">
          {dateText}
        </div>
      </div>
    </header>
  );
}
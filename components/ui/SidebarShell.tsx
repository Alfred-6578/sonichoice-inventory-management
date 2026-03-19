"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function SidebarShell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#111827]/40 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* MAIN AREA */}
      <div className="flex flex-col lg:ml-[250px]">
        <Topbar setIsOpen={setIsOpen} />
      </div>
    </>
  );
}
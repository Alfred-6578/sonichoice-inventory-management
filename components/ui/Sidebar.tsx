'use client'
import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";
import Link from "next/link";
import { MdDashboard, MdInventory2, MdLocationOn, MdPerson, MdSettings } from "react-icons/md";
import { BiSolidPackage } from "react-icons/bi";
import { IoIosPeople } from "react-icons/io";
import { X } from "lucide-react";

export default function Sidebar(
  {
    isOpen,
    setIsOpen
  }:{
    isOpen: boolean,
    setIsOpen: (val:boolean)=>void
  }
) {
  const [role, setRole] = useState("staff");

  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/dashboard", Icon: MdDashboard },
    { name: "Parcels", href: "/parcels", count: 9, Icon: BiSolidPackage },
    { name: "Branches", href: "/branches", Icon: MdLocationOn },
    { name: "Inventory", href: "/inventory", Icon: MdInventory2 },
  ];

  const peopleItems = [{ name: "Merchants", count: 4, href: "/merchants", Icon: IoIosPeople }];

  const adminItems = [
    { name: "User Management", count: 2, danger: true, href:"/user-management", Icon: MdPerson },
    { name: "Settings", href: "/settings", Icon:MdSettings },
  ];

  return (
    <aside className={`fixed z-40 w-[250px] h-screen bg-[#ffffff] border-r border-[#e4e7ec] flex flex-col
           ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
    `}>

      {/* LOGO */}
      <div className="flex h-[64px] px-4  justify-between border-b border-[#e4e7ec]">
        <div className="flex items-center gap-2 ">        
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center font-bold text-ink">
            S
          </div>
          <span className="text-ink font-semibold">SONICHOICE</span>
        </div>
        <button className="lg:hidden" onClick={()=>setIsOpen(false)}>
          <X className="text-ink-muted w-4.5"/>
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">

        <div className="text-[10px] text-[#9ca3af] uppercase tracking-widest px-2 mb-1">
          Operations
        </div>


        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-between px-4 mb-2 py-2 cursor-pointer rounded-md text-sm transition
              ${
                pathname === item.href
                  ? "bg-[#f4f5f7] text-[#111827] font-medium"
                  : "text-[#6b7280] hover:bg-[#f4f5f7] hover:text-[#111827]"
                }`}
          >
     
            <SidebarItem 
              key={item.name}
              label={item.name}
              Icon={item.Icon ?? ""}
              badge={item.count ? String(item.count) : undefined}
            />
          </Link>
        ))}

        {/* PEOPLE */}
        <div className="text-[10px] text-[#9ca3af] uppercase tracking-widest px-2 mt-4 mb-1">
          People
        </div>

        {peopleItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-between cursor-pointer px-4 mb-2 py-2 rounded-md text-sm transition
              ${
                pathname === item.href
                  ? "bg-[#f4f5f7] text-[#111827] font-medium"
                  : "text-[#6b7280] hover:bg-[#f4f5f7] hover:text-[#111827]"
                }`}
          >
     
            <SidebarItem 
              key={item.name}
              label={item.name}
              Icon={item.Icon ?? ""}
              badge={item.count ? String(item.count) : undefined}
            />
          </Link>
        ))}

        {/* ADMIN */}
        {role === "admin" && (
          <>
            <div className="text-[9px] text-[#9ca3af] uppercase tracking-widest px-2 mt-4 mb-1">
              Admin
            </div>

            {adminItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between cursor-pointer px-4 mb-2 py-2 rounded-md text-sm transition
                  ${
                    pathname === item.href
                      ? "bg-[#f4f5f7] text-[#111827] font-medium"
                      : "text-[#6b7280] hover:bg-[#f4f5f7] hover:text-[#111827]"
                    }`}
              >
                <SidebarItem 
                    key={item.name}
                    label={item.name}
                    Icon={item.Icon ?? ""}
                    badge={item.count ? String(item.count) : undefined}
                  />
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* ROLE SWITCH */}
      <div className="flex gap-2 p-2 border-t border-[#e4e7ec]">
        <button
          onClick={() => setRole("staff")}
          className={`flex-1 text-[10px] py-1 rounded border transition ${
            role === "staff"
              ? "bg-[#111827] text-white border-[#111827]"
              : "text-[#9ca3af] border-[#e4e7ec] hover:bg-[#f4f5f7]"
          }`}
        >
          Staff
        </button>

        <button
          onClick={() => setRole("admin")}
          className={`flex-1 text-[10px] py-1 rounded border transition ${
            role === "admin"
              ? "bg-[#111827] text-white border-[#111827]"
              : "text-[#9ca3af] border-[#e4e7ec] hover:bg-[#f4f5f7]"
          }`}
        >
          Admin
        </button>
      </div>

      {/* USER */}
      <div className="p-3 border-t border-[#e4e7ec]">
        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-[#f4f5f7] cursor-pointer">
          <div className="w-8 h-8 bg-[#111827] text-[#f59e0b] flex items-center justify-center rounded-md text-xs font-bold">
            EO
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#111827] truncate">
              Emeka Okafor
            </div>
            <div className="text-[10px] text-[#9ca3af]">
              {role === "admin" ? "Admin" : "Staff"} · Enugu
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
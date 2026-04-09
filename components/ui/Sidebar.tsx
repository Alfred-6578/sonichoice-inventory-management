'use client'
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";
import Link from "next/link";
import { MdDashboard, MdHistory, MdInventory2, MdLocationOn, MdPerson } from "react-icons/md";
import { BiSolidPackage } from "react-icons/bi";
import { IoIosPeople } from "react-icons/io";
import { X, LogOut } from "lucide-react";
import { logout, getStoredUser } from "@/lib/auth";

export default function Sidebar(
  {
    isOpen,
    setIsOpen
  }:{
    isOpen: boolean,
    setIsOpen: (val:boolean)=>void
  }
) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/dashboard", Icon: MdDashboard },
    { name: "Parcels", href: "/parcels", Icon: BiSolidPackage },
    { name: "Branches", href: "/branches", Icon: MdLocationOn },
    { name: "Inventory", href: "/inventory", Icon: MdInventory2 },
    { name: "Activity", href: "/activity", Icon: MdHistory },
  ];

  const peopleItems = [
    { name: "Merchants", href: "/merchants", Icon: IoIosPeople },
    { name: "Profile", href: "/profile", Icon: MdPerson },
  ];

  const adminItems = [
    { name: "Staff Management", danger: true, href:"/staff", Icon: MdPerson },
    // { name: "Settings", href: "/settings", Icon:MdSettings },
  ];

  return (
    <>
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
            />
          </Link>
        ))}

        {/* ADMIN */}
        {isAdmin && (
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
                  />
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* USER */}
      <div className="p-3 border-t border-[#e4e7ec]">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <div className="w-8 h-8 bg-[#111827] text-[#f59e0b] flex items-center justify-center rounded-md text-xs font-bold">
            {user?.name
              ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
              : "??"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#111827] truncate">
              {user?.name || "User"}
            </div>
            <div className="text-[10px] text-[#9ca3af] capitalize">
              {isAdmin ? "Admin" : "Staff"}
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={loggingOut}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9ca3af] hover:bg-red-50 hover:text-red-500 transition shrink-0"
            title="Logout"
          >
            <LogOut className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>

    </aside>

    {/* LOGOUT CONFIRMATION — full screen overlay */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-5" onClick={() => setShowLogoutConfirm(false)}>
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 max-w-72 w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-sm font-bold text-gray-900 mb-1">Sign out?</div>
          <div className="text-xs text-gray-500 mb-4">
            You&apos;ll need to sign in again to access your account.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`flex-1 px-3 py-2 text-xs rounded-lg text-white font-bold ${
                loggingOut ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
 
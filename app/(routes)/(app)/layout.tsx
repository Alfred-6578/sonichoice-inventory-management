import SidebarShell from "@/components/ui/SidebarShell";
import React from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div className="flex bg-surface min-h-screen">
        <SidebarShell />
        <main className=" w-full max-lg:!pt-25 px-4 py-14 tny:px-6">
            {children}
        </main>
   </div>
  );
}

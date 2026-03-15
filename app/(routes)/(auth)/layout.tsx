import SideContent from "@/components/login/SideContent";
import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div className="flex">
        <div className="h-screen">
            {children}
        </div>
   </div>
  );
}

"use client";

import { DM_Mono } from "next/font/google";
import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string
}

interface TableBodyProps<T> {
  data: T[];
  children: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
}

const dm_mono = DM_Mono({
    variable: "--font-dm_sans",
    subsets: ["latin"],
    weight: ["300","400","500"]
})

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

Table.Head = function ({ children }: TableProps) {
  return (
    <thead className={`border-b  border-[#e4e7ec] text-xs text-[#9ca3af] uppercase ${dm_mono.className}`}>
      {children}
    </thead>
  );
};

Table.Body = function <T,>({ data, children, onRowClick }: TableBodyProps<T>) {
  return (
    <tbody>
      {data.map((item, i) => (
        <tr
          key={i}
          className="border-b border-[#e4e7ec] hover:bg-[#f4f5f7] transition cursor-pointer"
          onClick={() => onRowClick?.(item)}
        >
          {children(item)}
        </tr>
      ))}
    </tbody>
  );
};

Table.Row = function ({ children, className }: TableProps) {
  return <tr className={className}>{children}</tr>;
};

interface TableCellProps {
  children: ReactNode;
  head?: boolean;
  className?: string
  onClick?: ()=> void
}

Table.Cell = function ({ children, head, className, onClick }: TableCellProps) {
  return (
    <td
      className={`px-4 ${
            head ? "font-medium text-left py-2" : "py-3 text-ink-muted"
        }
        ${className}
        
      `}
      onClick={onClick}
    >
      {children}
    </td>
  );
};
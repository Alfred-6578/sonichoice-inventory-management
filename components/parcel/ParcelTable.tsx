"use client";

import { useMemo, useState } from "react";
import { Table } from "../ui/Table";
import Tag from "../ui/Tag";
import AvatarName from "../ui/AvatarName";
import StatusBadge from "../ui/StatusBadge";
import { Parcel } from "@/types/parcelTypes";


type Status = "transit" | "pending" | "delivered" | "cancelled";


type SortKey = "id" | "size" | "date";

type Props = {
  data: Parcel[];
  setSelectedParcel: React.Dispatch<React.SetStateAction<Parcel|null>>
  onClearFilters?: () => void;
};

export default function ParcelTable({ data, onClearFilters, setSelectedParcel }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [asc, setAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setAsc(!asc);
    } else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let A: any = a[sortKey];
      let B: any = b[sortKey];

      if (sortKey === "date") {
        A = new Date(A).getTime();
        B = new Date(B).getTime();
      }

      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, asc]);

  const isEmpty = sortedData.length === 0;

  return (
    <div className="flex-1 overflow-auto">
      {!isEmpty ? (
        <Table>
          {/* HEADER */}
          <Table.Head>
            <Table.Row className="bg-white!" >
              <Table.Cell
                head
                className={`${sortKey == 'id' && "font-bold text-ink-muted"} cursor-pointer min-w-26`}
                onClick={() => handleSort("id")}
              >
                Parcel ID
                {sortKey === 'id' ? (
                  asc ? (
                    <span className="text-[8px] ml-1 font-extrabold">↑</span>
                  ) : (
                    <span className="text-[8px] ml-1 font-extrabold">↓</span>
                  )
                ) : null}
              </Table.Cell>

              <Table.Cell head className="min-w-37">Client</Table.Cell>
              <Table.Cell head>Route</Table.Cell>
              <Table.Cell head>Current Location</Table.Cell>

              <Table.Cell
                head
                className={`${sortKey === 'size' && " text-ink-muted"} cursor-pointer`}
                onClick={() => handleSort("size")}
              >
                Size
                {sortKey === 'size' ? (
                  asc ? (
                    <span className="text-[8px] ml-1 font-extrabold">↑</span>
                  ) : (
                    <span className="text-[8px] ml-1 font-extrabold">↓</span>
                  )
                ) : null}
              </Table.Cell>

              <Table.Cell head>Status</Table.Cell>

              <Table.Cell
                head
                className={`${sortKey === 'date' && " text-ink-muted"} cursor-pointer`}
                onClick={() => handleSort("date")}
              >
                Date In
                {sortKey === 'date' ? (
                  asc ? (
                    <span className="text-[8px] ml-1 font-extrabold">↑</span>
                  ) : (
                    <span className="text-[8px] ml-1 font-extrabold">↓</span>
                  )
                ) : null}
              </Table.Cell>
            </Table.Row>
          </Table.Head>

          {/* BODY */}
          <Table.Body data={sortedData} onRowClick={(p) => setSelectedParcel(p)}>
            {(p) => (
              <>
                {/* ID */}
                <Table.Cell className="font-mono text-[11px] text-ink-subtle">
                  <Tag label={p.id}/>
                </Table.Cell>

                {/* Client */}
                <Table.Cell>
                
                  <AvatarName 
                    color={p.clientColor}
                    initials={p.clientAv}
                    name={p.client}
                    company={p.clientCo}
                  />
                </Table.Cell>

                {/* Route */}
                <Table.Cell className="text-[12px] text-ink-muted">
                  {p.from} → {p.to}
                </Table.Cell>

                {/* Current */}
                <Table.Cell>{p.current}</Table.Cell>

                {/* Size */}
                <Table.Cell>
                    <Tag label={p.size}/>

                </Table.Cell>

                {/* Status */}
                <Table.Cell>
                 
                  <StatusBadge status={p.status}/>
                </Table.Cell>

                {/* Date */}
                <Table.Cell className="text-[11px] font-mono text-ink-subtle">
                  {p.date}
                </Table.Cell>
              </>
            )}
          </Table.Body>
        </Table>
      ) : (
        /* EMPTY STATE */
        <div className="text-center py-14">
          <div className="w-11 h-11 mx-auto mb-3 rounded-lg bg-surface border border-border flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-ink-subtle">
              <path d="M20 8h-2.81..." />
            </svg>
          </div>

          <div className="text-ink font-medium">
            No parcels match your filters
          </div>

          <div className="text-ink-subtle text-sm mb-4">
            Try adjusting your search or clearing filters
          </div>

          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-ink text-white rounded-lg text-[13px] font-bold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
import { useMemo, useState } from "react"
import { InventoryItem } from "@/types/inventory"
import { Table } from "@/components/ui/Table"
import { totalStock } from "@/lib/inventory-utils"
import AvatarName from "../ui/AvatarName"
import Tag from "../ui/Tag"

type SortKey = "name" | "totalQty" | "dateIn" | "updatedAt"

function SortArrow({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return null
  return <span className="text-[8px] ml-1 font-extrabold">{asc ? "↑" : "↓"}</span>
}

export default function InventoryTable({
  items,
  onSelect,
}: {
  items: InventoryItem[]
  onSelect: (item: InventoryItem) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [asc, setAsc] = useState(true)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setAsc(!asc)
    } else {
      setSortKey(key)
      setAsc(true)
    }
  }

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let A: any = a[sortKey]
      let B: any = b[sortKey]

      if (sortKey === "dateIn" || sortKey === "updatedAt") {
        A = A ? new Date(A).getTime() : 0
        B = B ? new Date(B).getTime() : 0
      }

      if (sortKey === "totalQty") {
        A = totalStock(a)
        B = totalStock(b)
      }

      if (A < B) return asc ? -1 : 1
      if (A > B) return asc ? 1 : -1
      return 0
    })
  }, [items, sortKey, asc])

  const isEmpty = sortedItems.length === 0

  return (
    <div className="flex-1 overflow-auto">
      {!isEmpty ? (
        <Table>
          <Table.Head>
            <Table.Row className="bg-white">
              <Table.Cell head>Tracking ID</Table.Cell>
              <Table.Cell
                head
                className={`cursor-pointer ${sortKey === "name" ? "font-bold text-ink-muted" : ""}`}
                onClick={() => handleSort("name")}
              >
                Item
                <SortArrow active={sortKey === "name"} asc={asc} />
              </Table.Cell>
              <Table.Cell head>Merchant</Table.Cell>
              <Table.Cell head className="min-w-30">Stored At</Table.Cell>
              <Table.Cell
                head
                className={`cursor-pointer min-w-30 ${sortKey === "totalQty" ? "font-bold text-ink-muted" : ""}`}
                onClick={() => handleSort("totalQty")}
              >
                Total Stock
                <SortArrow active={sortKey === "totalQty"} asc={asc} />
              </Table.Cell>
              <Table.Cell
                head
                className={`cursor-pointer ${sortKey === "dateIn" ? "font-bold text-ink-muted" : ""}`}
                onClick={() => handleSort("dateIn")}
              >
                Date In
                <SortArrow active={sortKey === "dateIn"} asc={asc} />
              </Table.Cell>
              <Table.Cell
                head
                className={`cursor-pointer ${sortKey === "updatedAt" ? "font-bold text-ink-muted" : ""}`}
                onClick={() => handleSort("updatedAt")}
              >
                Updated
                <SortArrow active={sortKey === "updatedAt"} asc={asc} />
              </Table.Cell>
            </Table.Row>
          </Table.Head>

          <Table.Body data={sortedItems} onRowClick={onSelect}>
            {(item) => (
              <>
                <Table.Cell>
                    <Tag label={item.sku} />
                </Table.Cell>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>
                    <AvatarName
                        color={item.merchant.color}
                        initials={item.merchant.av}
                        name={item.merchant.name}
                    />
                </Table.Cell>
                <Table.Cell className="flex flex-wrap gap-1 items-center">
                  {Object.entries(item.stock)
                    .filter(([, qty]) => qty != null && qty > 0)
                    .map(([branch, qty], index) => (
                        <span key={index} className="bg-transit-bg text-transit text-[11px] p-1 border border-transit-border">
                            {branch} ({qty})
                        </span>
                    ))}
                </Table.Cell>
                <Table.Cell>{totalStock(item)}</Table.Cell>
                <Table.Cell>{item.dateIn}</Table.Cell>
                <Table.Cell className="text-ink-subtle text-[11px] font-mono">{item.updatedAt}</Table.Cell>
              </>
            )}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-14">
          <div className="text-ink font-medium">No inventory items found</div>
        </div>
      )}
    </div>
  )
}

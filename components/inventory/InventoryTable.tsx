import { InventoryItem } from "@/types/inventory"
import { Table } from "@/components/ui/Table"
import { totalStock, isLow, isCritical } from "@/lib/inventory-utils"
import AvatarName from "../ui/AvatarName"
import Tag from "../ui/Tag"

export default function InventoryTable({
  items,
  onSelect,
}: {
  items: InventoryItem[]
  onSelect: (item: InventoryItem) => void
}) {
  const isEmpty = items.length === 0

  return (
    <div className="flex-1 overflow-auto">
      {!isEmpty ? (
        <Table>
          <Table.Head>
            <Table.Row className="bg-white">
              <Table.Cell head>SKU</Table.Cell>
              <Table.Cell head>Item</Table.Cell>
              <Table.Cell head>Merchant</Table.Cell>
              {/* <Table.Cell head>Category</Table.Cell> */}
              <Table.Cell head className="min-w-30">Stored At</Table.Cell>
              <Table.Cell head className="min-w-30">Total Stock</Table.Cell>
              <Table.Cell head >Date In</Table.Cell>
            </Table.Row>
          </Table.Head>

          <Table.Body data={items} onRowClick={onSelect}>
            {(item) => (
              <>
                <Table.Cell>
                    <Tag
                        label={item.sku}
                    />
                    
                </Table.Cell>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>
                    <AvatarName 
                        color={item.merchant.color}
                        initials={item.merchant.av}
                        name={item.merchant.name }
                    />
                </Table.Cell>
                {/* <Table.Cell>{item.category}</Table.Cell> */}
                <Table.Cell className="flex flex-wrap gap-1 items-center">
                  {Object.entries(item.stock)
                    .filter(([, qty]) => qty != null && qty > 0)
                    .map(([branch, qty], index) => (
                        <span key={index} className="bg-transit-bg text-transit text-[11px] p-1 border border-transit-border">
                            {branch} ({qty})
                        </span>

                    ))
                    }
                  
                </Table.Cell>
                <Table.Cell>{totalStock(item)}</Table.Cell>
                <Table.Cell>{item.dateIn}</Table.Cell>

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
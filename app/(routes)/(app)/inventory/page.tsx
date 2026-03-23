"use client"

import { useState, useMemo } from "react"
import { InventoryItem } from "@/types/inventory"
import InventoryTable from "@/components/inventory/InventoryTable"
import FilterBar, { FilterConfig } from "@/components/ui/FilterBar"
import InventoryDetailPanel from "@/components/inventory/InventoryDetailPanel"
import AddProductForm from "@/components/inventory/AddProductForm"
import PageHeader from "@/components/ui/PageHeader"
import { Download, Plus } from "lucide-react"
import { INVENTORY } from "@/data/inventoryData"
import Overlay from "@/components/ui/Overlay"

type InventoryFilters = {
  search: string
  category: string
  merchant: string
}

const uniqueCategories = Array.from(new Set(INVENTORY.map((item) => item.category)))
const uniqueMerchants = Array.from(new Set(INVENTORY.map((item) => item.merchant.name)))

const configs: FilterConfig[] = [
  {
    label: "Category",
    key: "category",
    options: uniqueCategories.map((category) => ({ value: category, label: category })),
  },
  {
    label: "Merchant",
    key: "merchant",
    options: uniqueMerchants.map((merchant) => ({ value: merchant, label: merchant })),
  },
]

const InventoryPage = () => {
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    category: "",
    merchant: "",
  })

  const filteredItems = useMemo(() => {
    return INVENTORY.filter((item) => {
      const search = filters.search.trim().toLowerCase();
      if (search && !item.name.toLowerCase().includes(search)) {
        return false;
      }
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      if (filters.merchant && item.merchant.name !== filters.merchant) {
        return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="flex flex-col gap-6 h-full">
     
        <PageHeader 
            headerText='Inventory · 5 merchants · 14 product entries'
            mainText={'Inventory'}
            subText='3,847 total units across all branches · 2 products below minimum stock threshold
'
            button1="Export"
            button2="Add Product"
            button1Icon={<Download/>}
            button2Icon={<Plus/>}
            onButton1={()=> {}}
            onButton2={()=> setFormOpen(true)}
        />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          total={filteredItems.length}
          onChange={(f) => setFilters(f)}
          filterConfigs={configs}
          resetKeys={["search", "category", "merchant"]}
        />

        <InventoryTable
          items={filteredItems}
          onSelect={setSelected}
        />

      
      <InventoryDetailPanel
        item={selected}
        onClose={() => setSelected(null)}
      />

      <AddProductForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(formData) => {
          console.log('Form submitted:', formData)
          setFormOpen(false)
        }}
      />

      <Overlay
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        zIndex={59}
        />

    </div>
  )
}

export default InventoryPage
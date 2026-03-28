"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { InventoryItem } from "@/types/inventory"
import InventoryTable from "@/components/inventory/InventoryTable"
import FilterBar, { FilterConfig } from "@/components/ui/FilterBar"
import InventoryDetailPanel from "@/components/inventory/InventoryDetailPanel"
import AddProductForm from "@/components/inventory/AddProductForm"
import PageHeader from "@/components/ui/PageHeader"
import { Download, Plus } from "lucide-react"
import Overlay from "@/components/ui/Overlay"
import { getProducts, getProduct, ApiProduct } from "@/lib/products"

type InventoryFilters = {
  search: string
  category: string
  merchant: string
}

const PAGE_SIZE = 20

function mapApiProduct(p: ApiProduct): InventoryItem {
  const merchantName = p.merchant?.name || "Unknown"
  const initials = merchantName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return {
    id: p.id,
    sku: p.id.slice(0, 8).toUpperCase(),
    name: p.name,
    category: p.description || "",
    unit: "pcs",
    merchant: {
      name: merchantName,
      av: initials,
      color: p.merchant?.color || "#374151",
      contact: p.merchant?.name || "",
      phone: p.merchant?.phone || "",
      email: p.merchant?.email || "",
    },
    stock: p.branch
      ? { [p.branch.name]: p.quantity ?? 0 }
      : p.quantity != null
        ? { Default: p.quantity }
        : {},
    totalQty: p.quantity ?? 0,
    lowAlert: 10,
    dateIn: p.dateReceived
      ? new Date(p.dateReceived).toISOString().split("T")[0]
      : p.createdAt
        ? new Date(p.createdAt).toISOString().split("T")[0]
        : "",
    notes: p.additionalInfo || "",
    history: [],
  }
}

const configs: FilterConfig[] = [
  {
    label: "Category",
    key: "category",
    options: null,
  },
  {
    label: "Merchant",
    key: "merchant",
    options: null,
  },
]

const InventoryPage = () => {
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const latestSelectId = useRef<string | null>(null)

  const handleSelect = async (item: InventoryItem) => {
    const clickedId = item.id
    latestSelectId.current = clickedId
    setSelected(item) // show immediately with list data
    setDetailLoading(true)
    try {
      const full = await getProduct(item.id)
      // Only update if this is still the latest clicked product
      if (latestSelectId.current === clickedId) {
        setSelected(mapApiProduct(full))
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err)
    } finally {
      if (latestSelectId.current === clickedId) {
        setDetailLoading(false)
      }
    }
  }
  const [formOpen, setFormOpen] = useState(false)
  const [allItems, setAllItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    category: "",
    merchant: "",
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await getProducts()

      console.log("API response:", res)

      const raw = res.products || res.data || (Array.isArray(res) ? res : [])
      const mapped = (raw as ApiProduct[]).map(mapApiProduct)
      setAllItems(mapped)

      // Update filter options dynamically
      const categories = Array.from(new Set(mapped.map((i) => i.category).filter(Boolean)))
      const merchants = Array.from(new Set(mapped.map((i) => i.merchant.name).filter(Boolean)))

      configs[0].options = categories.map((c) => ({ value: c, label: c }))
      configs[1].options = merchants.map((m) => ({ value: m, label: m }))
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Client-side filtering
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filters.search) {
        const s = filters.search.toLowerCase()
        if (
          !item.name.toLowerCase().includes(s) &&
          !item.sku.toLowerCase().includes(s) &&
          !item.merchant.name.toLowerCase().includes(s)
        ) return false
      }
      if (filters.category && item.category !== filters.category) return false
      if (filters.merchant && item.merchant.name !== filters.merchant) return false
      return true
    })
  }, [allItems, filters])

  // Client-side pagination
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, page])

  // Reset to page 1 when filters change
  const handleFilterChange = (f: InventoryFilters) => {
    setPage(1)
    setFilters(f)
  }

  return (
    <div className="flex flex-col gap-6 h-full">

        <PageHeader
            headerText={`Inventory · ${allItems.length} products`}
            mainText={'Inventory'}
            subText={loading ? 'Loading...' : `Showing ${paginatedItems.length} of ${filteredItems.length} products · Page ${page} of ${totalPages}`}
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
          onChange={(f) => handleFilterChange(f)}
          filterConfigs={configs}
          resetKeys={["search", "category", "merchant"]}
        />

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-14 text-ink-muted">Loading products...</div>
        ) : (
          <InventoryTable
            items={paginatedItems}
            onSelect={handleSelect}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

      <InventoryDetailPanel
        item={selected}
        onClose={() => setSelected(null)}
        onUpdated={() => {
          setSelected(null)
          fetchProducts()
        }}
      />

      <AddProductForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={() => {
          setFormOpen(false)
          fetchProducts()
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

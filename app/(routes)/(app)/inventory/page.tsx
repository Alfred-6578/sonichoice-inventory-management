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
import { getProducts, getProduct, ApiProduct, exportProducts } from "@/lib/products"
import { getBranches } from "@/lib/branches"

type InventoryFilters = {
  search: string
  branch: string
  merchant: string
}

function buildStock(p: ApiProduct): Record<string, number> {
  if (p.stocks && p.stocks.length > 0) {
    const stock: Record<string, number> = {}
    for (const entry of p.stocks) {
      const name = entry.branch?.name || "Unknown"
      stock[name] = entry.quantity ?? 0
    }
    return stock
  }
  if (p.branch) return { [p.branch.name]: p.quantity ?? 0 }
  if (p.quantity != null) return { Default: p.quantity }
  return {}
}

function calcTotal(p: ApiProduct): number {
  if (p.stocks && p.stocks.length > 0) {
    return p.stocks.reduce((sum, entry) => sum + (entry.quantity ?? 0), 0)
  }
  return p.quantity ?? 0
}

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
    sku: p.trackingId || p.id.slice(0, 8).toUpperCase(),
    name: p.name,
    category: p.description ?? "",
    unit: "pcs",
    merchant: {
      name: merchantName,
      av: initials,
      color: p.merchant?.color || "#374151",
      contact: p.merchant?.name || "",
      phone: p.merchant?.phone || "",
      email: p.merchant?.email || "",
    },
    stock: buildStock(p),
    totalQty: calcTotal(p),
    lowAlert: 10,
    dateIn: p.dateReceived
      ? new Date(p.dateReceived).toISOString().split("T")[0]
      : p.createdAt
        ? new Date(p.createdAt).toISOString().split("T")[0]
        : "",
    notes: p.additionalInfo ?? "",
    history: [],
  }
}

const configs: FilterConfig[] = [
  {
    label: "Branch",
    key: "branch",
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
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showExportMenu])

  const handleExport = async (format: "pdf" | "excel") => {
    setShowExportMenu(false)
    setExporting(true)
    try {
      await exportProducts(format)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    branch: "",
    merchant: "",
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await getProducts({
        page,
        search: filters.search || undefined,
      })

      const raw = res.products || res.data || (Array.isArray(res) ? res : [])
      const mapped = (raw as ApiProduct[]).map(mapApiProduct)

      setItems(mapped)


      if (res.meta) {
        setTotalCount(res.meta.total)
        setTotalPages(res.meta.lastPage)
      }

      // Fetch all branches for filter dropdown (deduplicate by name)
      const allBranches = await getBranches()
      const uniqueBranchNames = Array.from(new Set(allBranches.map((b) => b.name)))
      configs[0].options = uniqueBranchNames.map((name) => ({ value: name, label: name }))

      const merchants = Array.from(new Set(mapped.map((i) => i.merchant.name).filter(Boolean)))
      configs[1].options = merchants.map((m) => ({ value: m, label: m }))
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [page, filters.search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Client-side filtering for category/merchant (API handles search + pagination)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.branch && !Object.keys(item.stock).includes(filters.branch)) return false
      if (filters.merchant && item.merchant.name !== filters.merchant) return false
      return true
    })
  }, [items, filters])

  // Reset to page 1 when search changes
  const handleFilterChange = (f: InventoryFilters) => {
    if (f.search !== filters.search) setPage(1)
    setFilters(f)
  }

  return (
    <div className="flex flex-col gap-6 h-full">

        <PageHeader
            headerText={`Inventory · ${totalCount} products`}
            mainText={'Inventory'}
            subText={loading ? 'Loading...' : `Showing ${filteredItems.length} of ${totalCount} products · Page ${page} of ${totalPages}`}
            button1="Export"
            button1Icon={<Download/>}
            onButton1={() => setShowExportMenu(!showExportMenu)}
            button2="Add Product"
            button2Icon={<Plus/>}
            onButton2={()=> setFormOpen(true)}
        />

        {/* Export dropdown */}
        <div ref={exportRef} className="relative w-full right-0  inline-block self-start -mt-2 ">
        
          {showExportMenu && (
            <div className="absolute -top-16 xsm:-top-3 md:-top-8 left-0 md:right-4 mt-1 bg-white border border-border rounded-lg shadow-lg z-20 min-w-36">
              <button
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-surface transition first:rounded-t-lg"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-surface transition border-t border-border last:rounded-b-lg"
              >
                Export as Excel
              </button>
            </div>
          )}
        </div>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          total={filteredItems.length}
          onChange={(f) => handleFilterChange(f)}
          filterConfigs={configs}
          resetKeys={["search", "branch", "merchant"]}
        />

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <InventoryTableSkeleton />
        ) : (
          <InventoryTable
            items={filteredItems}
            onSelect={handleSelect}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
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

function InventoryTableSkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-200">
            {["SKU", "Item", "Merchant", "Stored At", "Total Stock", "Date In"].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-gray-400 uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-3 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-3 py-3"><div className="h-4 w-10 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryPage

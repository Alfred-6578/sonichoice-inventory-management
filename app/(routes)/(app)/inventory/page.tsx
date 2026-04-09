"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { InventoryItem } from "@/types/inventory"
import InventoryTable from "@/components/inventory/InventoryTable"
import FilterBar, { FilterConfig } from "@/components/ui/FilterBar"
import InventoryDetailPanel from "@/components/inventory/InventoryDetailPanel"
import AddProductForm from "@/components/inventory/AddProductForm"
import PageHeader from "@/components/ui/PageHeader"
import { Download, Plus } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Overlay from "@/components/ui/Overlay"
import { getProducts, getProduct, ApiProduct } from "@/lib/products"
import { getBranches } from "@/lib/branches"
import { useDebounce } from "@/hooks/useDebounce"
import ExportPreviewModal from "@/components/ui/ExportPreviewModal"
import { ExportConfig } from "@/lib/export"
import ErrorCard from "@/components/ui/ErrorCard"

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
      : "",
    updatedAt: p.updatedAt
      ? new Date(p.updatedAt).toISOString().split("T")[0]
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const latestSelectId = useRef<string | null>(null)
  const hasAppliedParams = useRef(false)

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
  const [showExportPreview, setShowExportPreview] = useState(false)
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

  const debouncedSearch = useDebounce(filters.search)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await getProducts({
        page,
        search: debouncedSearch || undefined,
      })

      const raw = res.products || res.data || (Array.isArray(res) ? res : [])
      console.log("[Fetch Products] raw sample:", (raw as ApiProduct[]).slice(0, 2).map(p => p))
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
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Apply URL query params (from ProductListModal navigation)
  useEffect(() => {
    if (hasAppliedParams.current || loading || items.length === 0) return

    const searchQuery = searchParams.get("search")
    const productId = searchParams.get("productId")

    if (searchQuery || productId) {
      hasAppliedParams.current = true

      if (searchQuery) {
        setFilters((prev) => ({ ...prev, search: searchQuery }))
      }

      if (productId) {
        const match = items.find((i) => i.id === productId)
        if (match) {
          handleSelect(match)
        } else {
          // Product might be on a different page, fetch it directly
          getProduct(productId)
            .then((full) => setSelected(mapApiProduct(full)))
            .catch(() => {})
        }
      }

      // Clean URL params without reload
      router.replace("/inventory", { scroll: false })
    }
  }, [loading, items, searchParams])

  // Client-side filtering for category/merchant (API handles search + pagination)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.branch && !Object.keys(item.stock).includes(filters.branch)) return false
      if (filters.merchant && item.merchant.name !== filters.merchant) return false
      return true
    })
  }, [items, filters])

  const exportConfig: ExportConfig = {
    title: "Inventory Report",
    subtitle: `${filteredItems.length} products · Page ${page} of ${totalPages}`,
    filename: "sonichoice-inventory",
    columns: [
      { header: "SKU", key: "sku", width: 14 },
      { header: "Product Name", key: "name", width: 28 },
      { header: "Merchant", key: "merchant", width: 22 },
      { header: "Total Stock", key: "totalQty", width: 12 },
      { header: "Date In", key: "dateIn", width: 14 },
    ],
    rows: filteredItems.map((item) => ({
      sku: item.sku,
      name: item.name,
      merchant: item.merchant.name,
      totalQty: item.totalQty,
      dateIn: item.dateIn,
    })),
  }

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
            subText={`Showing ${filteredItems.length} of ${totalCount} products · Page ${page} of ${totalPages}`}
            loading={loading}
            button1="Export"
            button1Icon={<Download/>}
            onButton1={() => setShowExportPreview(true)}
            button2="Add Product"
            button2Icon={<Plus/>}
            onButton2={()=> setFormOpen(true)}
        />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          total={filteredItems.length}
          onChange={(f) => handleFilterChange(f)}
          filterConfigs={configs}
          resetKeys={["search", "branch", "merchant"]}
          disabled={loading}
        />

        {loading ? (
          <InventoryTableSkeleton />
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchProducts} />
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

      <ExportPreviewModal
        isOpen={showExportPreview}
        onClose={() => setShowExportPreview(false)}
        config={exportConfig}
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

import { Suspense } from "react"

export default function InventoryPageWrapper() {
  return (
    <Suspense>
      <InventoryPage />
    </Suspense>
  )
}

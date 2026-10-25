"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { InventoryItem, StockRow } from "@/types/inventory"
import InventoryTable from "@/components/inventory/InventoryTable"
import FilterBar, { FilterConfig } from "@/components/ui/FilterBar"
import InventoryDetailPanel from "@/components/inventory/InventoryDetailPanel"
import AddProductForm from "@/components/inventory/AddProductForm"
import PageHeader from "@/components/ui/PageHeader"
import { Download, Plus, UploadCloud } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Overlay from "@/components/ui/Overlay"
import { getProducts, getProduct, bulkUploadProducts, ApiProduct } from "@/lib/products"
import BulkUploadModal from "@/components/ui/BulkUploadModal"
import { TemplateColumn } from "@/lib/bulk-upload"
import { getBranches } from "@/lib/branches"
import { getAllMerchants } from "@/lib/merchants"
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

// Keeps branchId and lowStockAlert, which buildStock() above has to drop to
// produce its name-keyed display map. The edit panel needs both.
function buildStockRows(p: ApiProduct): StockRow[] {
  if (p.stocks && p.stocks.length > 0) {
    return p.stocks.map((entry) => ({
      branchId: entry.branchId || entry.branch?.id || "",
      branchName: entry.branch?.name || "Unknown",
      quantity: entry.quantity ?? 0,
      lowStockAlert: entry.lowStockAlert ?? 0,
    }))
  }
  if (p.branch) {
    return [
      {
        branchId: p.branch.id,
        branchName: p.branch.name,
        quantity: p.quantity ?? 0,
        lowStockAlert: 0,
      },
    ]
  }
  return []
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
    stockRows: buildStockRows(p),
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

// The backend AI maps headers itself, so `aliases` documents the accepted
// variations for the user rather than constraining the sheet. Product name is the
// only required field.
const PRODUCT_TEMPLATE_COLUMNS: TemplateColumn[] = [
  {
    header: "Product Name",
    required: true,
    aliases: ["Product", "Name", "Item", "Item Name", "product_name"],
    example: "Ceramic Mug 350ml",
    width: 26,
  },
  {
    header: "Merchant",
    aliases: ["Merchant Name", "Supplier", "Vendor", "Store", "Brand"],
    example: "Bright Traders",
    width: 22,
  },
  {
    header: "Branch",
    aliases: ["Branch Name", "Location", "Store", "Outlet"],
    example: "Enugu",
    width: 22,
  },
  {
    header: "Quantity",
    aliases: ["Qty", "Stock", "Count", "Amount"],
    example: "120",
    width: 12,
  },
  {
    header: "Low Stock Alert",
    aliases: ["Low Stock", "Alert", "Threshold", "Min Stock"],
    example: "10",
    width: 16,
  },
  {
    header: "Description",
    aliases: ["Details", "Info", "Product Description"],
    example: "Matte white, boxed in 12s",
    width: 30,
  },
  {
    header: "Date Received",
    aliases: ["Date", "Received Date", "Added Date"],
    example: "2026-08-01",
    width: 16,
  },
  {
    header: "Additional Info",
    aliases: ["Notes", "Remarks", "Comments", "Extra"],
    example: "Fragile — stack max 3 high",
    width: 30,
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
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [allBranches, setAllBranches] = useState<{ id: string; name: string }[]>([])
  const [allMerchants, setAllMerchants] = useState<{ id: string; name: string }[]>([])
  const [merchantsLoading, setMerchantsLoading] = useState(true)
  const allBranchesRef = useRef(allBranches)
  const allMerchantsRef = useRef(allMerchants)
  allBranchesRef.current = allBranches
  allMerchantsRef.current = allMerchants
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
      // Resolve the selected names to ids so the API does the filtering — doing
      // it client-side would only ever filter the page already on screen.
      const branchId = allBranchesRef.current.find((b) => b.name === filters.branch)?.id
      const merchantId = allMerchantsRef.current.find((m) => m.name === filters.merchant)?.id

      const res = await getProducts({
        page,
        search: debouncedSearch || undefined,
        branchId: branchId || undefined,
        merchantId: merchantId || undefined,
      })

      const raw = res.products || res.data || (Array.isArray(res) ? res : [])
      const mapped = (raw as ApiProduct[]).map(mapApiProduct)

      setItems(mapped)

      if (res.meta) {
        setTotalCount(res.meta.total)
        setTotalPages(res.meta.lastPage)
      }
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.branch, filters.merchant])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Dropdown sources, loaded once. Merchants are paged through in full so the
  // filter lists the whole network, not just the backend's first page.
  useEffect(() => {
    getBranches()
      .then((bs) =>
        setAllBranches(
          Array.from(
            new Map(bs.map((b) => [b.name, { id: b.id, name: b.name }])).values()
          )
        )
      )
      .catch(() => {})

    setMerchantsLoading(true)
    getAllMerchants()
      .then((ms) => setAllMerchants(ms.map((m) => ({ id: m.id, name: m.name }))))
      .catch(() => {})
      .finally(() => setMerchantsLoading(false))
  }, [])

  const configs: FilterConfig[] = useMemo(
    () => [
      {
        label: "Branch",
        key: "branch",
        options: allBranches.map((b) => ({ value: b.name, label: b.name })),
        searchable: true,
      },
      {
        label: "Merchant",
        key: "merchant",
        options: allMerchants.map((m) => ({ value: m.name, label: m.name })),
        // The whole merchant network can be long, and paging it takes a moment.
        searchable: true,
        loading: merchantsLoading,
      },
    ],
    [allBranches, allMerchants, merchantsLoading]
  )

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

  const exportConfig: ExportConfig = {
    title: "Inventory Report",
    subtitle: `${items.length} products · Page ${page} of ${totalPages}`,
    filename: "sonichoice-inventory",
    columns: [
      { header: "SKU", key: "sku", width: 14 },
      { header: "Product Name", key: "name", width: 28 },
      { header: "Merchant", key: "merchant", width: 22 },
      { header: "Total Stock", key: "totalQty", width: 12 },
      { header: "Date In", key: "dateIn", width: 14 },
    ],
    rows: items.map((item) => ({
      sku: item.sku,
      name: item.name,
      merchant: item.merchant.name,
      totalQty: item.totalQty,
      dateIn: item.dateIn,
    })),
  }

  // Any filter change invalidates the current page offset
  const handleFilterChange = (f: InventoryFilters) => {
    if (
      f.search !== filters.search ||
      f.branch !== filters.branch ||
      f.merchant !== filters.merchant
    ) {
      setPage(1)
    }
    setFilters(f)
  }

  return (
    <div className="flex flex-col gap-6 h-full">

        <PageHeader
            headerText={`Inventory · ${totalCount} products`}
            mainText={'Inventory'}
            subText={`Showing ${items.length} of ${totalCount} products · Page ${page} of ${totalPages}`}
            loading={loading}
            button1="Export"
            button1Icon={<Download/>}
            onButton1={() => setShowExportPreview(true)}
            button3="Bulk Upload"
            button3Icon={<UploadCloud size={16}/>}
            onButton3={() => setShowBulkUpload(true)}
            button2="Add Product"
            button2Icon={<Plus/>}
            onButton2={()=> setFormOpen(true)}
        />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          total={items.length}
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
            items={items}
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

      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Bulk Upload Products"
        subtitle="Import products and their per-branch stock from a spreadsheet"
        columns={PRODUCT_TEMPLATE_COLUMNS}
        templateFilename="sonichoice-products-template"
        onUpload={bulkUploadProducts}
        onSuccess={fetchProducts}
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
            {["SKU", "Item", "Merchant", "Stored At", "Total Stock", "Updated"].map((h) => (
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

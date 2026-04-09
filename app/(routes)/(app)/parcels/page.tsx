'use client'
import DetailPanel from '@/components/parcel/DetailPanel'
import ParcelFormPanel from '@/components/parcel/ParcelFormPanel'
import ParcelTable from '@/components/parcel/ParcelTable'
import FilterBar from '@/components/ui/FilterBar'
import Overlay from '@/components/ui/Overlay'
import PageHeader from '@/components/ui/PageHeader'
import StatusPillsContainer from '@/components/ui/StatusPillsContainer'
import { Filters, Parcel } from '@/types/parcelTypes'
import { Download, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getParcels, getParcel, ApiParcel, ParcelStatusCounts } from '@/lib/parcels'
import ExportPreviewModal from '@/components/ui/ExportPreviewModal'
import { ExportConfig } from '@/lib/export'
import ErrorCard from '@/components/ui/ErrorCard'
import { useDebounce } from '@/hooks/useDebounce'
import { getBranches } from '@/lib/branches'
import { getMerchants } from '@/lib/merchants'

function mapApiParcel(p: ApiParcel): Parcel {
  // Build unique merchant list from the merchants array or items
  const allMerchantsList = (p.merchants || (p.merchant ? [p.merchant] : [])).map((m) => ({
    name: m.name,
    initials: m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    color: m.color || "#374151",
  }))

  // Deduplicate by name
  const seen = new Set<string>()
  const uniqueMerchants = allMerchantsList.filter((m) => {
    if (seen.has(m.name)) return false
    seen.add(m.name)
    return true
  })

  const merchant = p.merchants?.[0] || p.merchant
  const merchantName = merchant?.name || "Unknown"
  const initials = merchantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  // Build description from items
  const desc = p.items && p.items.length > 0
    ? p.items.map(i => `${i.product?.name || "Item"} x${i.quantity}`).join(", ")
    : "Parcel"

  const statusMap: Record<string, Parcel["status"]> = {
    PENDING: "pending",
    IN_TRANSIT: "transit",
    RECEIVED: "received",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  }

  return {
    id: p.trackingNumber,
    apiId: p.id,
    desc,
    size: p.size || "Medium",
    from: p.fromBranch?.name || "",
    to: p.toBranch?.name || "",
    current: p.currentBranch?.name || "",
    status: statusMap[p.status] || "pending",
    dateSent: p.dateShipped ? new Date(p.dateShipped).toISOString().split("T")[0] : p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
    dateReceived: p.dateDelivered ? new Date(p.dateDelivered).toISOString().split("T")[0] : "",
    notes: p.additionalInfo || "",
    client: merchantName,
    clientCo: "",
    clientAv: initials,
    clientColor: merchant?.color || "#374151",
    recipient: "",
    recipientPhone: "",
    merchants: uniqueMerchants,
    fromBranchId: p.fromBranchId,
    toBranchId: p.toBranchId,
    currentBranchId: p.currentBranchId,
    history: [],
    items: (p.items || []).map((i) => {
      const productMerchant = (i.product as any)?.merchant;
      return {
        productId: i.productId,
        productName: i.product?.name || "Product",
        trackingId: i.product?.trackingId || i.productId.slice(0, 8),
        description: (i.product?.description as string) ?? "",
        quantity: i.quantity,
        merchantId: productMerchant?.id || (i.product?.merchantId as string) || "",
        merchantName: productMerchant?.name || "",
        merchantColor: productMerchant?.color || "#374151",
      };
    }),
  }
}

const ParcelPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasAppliedParams = useRef(false)
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusCounts, setStatusCounts] = useState<ParcelStatusCounts>({ all: 0, in_transit: 0, pending: 0, received: 0, cancelled: 0, returned: 0 })
  const [allBranches, setAllBranches] = useState<{ id: string; name: string }[]>([])
  const [allMerchants, setAllMerchants] = useState<{ id: string; name: string }[]>([])
  const allBranchesRef = useRef(allBranches)
  const allMerchantsRef = useRef(allMerchants)
  allBranchesRef.current = allBranches
  allMerchantsRef.current = allMerchants

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
    branch: "",
    merchant: "",
  })

  const debouncedSearch = useDebounce(filters.search)

  const fetchParcels = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const branchId = allBranchesRef.current.find(b => b.name === filters.branch)?.id
      const merchantId = allMerchantsRef.current.find(m => m.name === filters.merchant)?.id

      const res = await getParcels({
        page,
        search: debouncedSearch || undefined,
        status: filters.status !== "all" ? (filters.status === "transit" ? "IN_TRANSIT" : filters.status.toUpperCase()) : undefined,
        merchantId: merchantId || undefined,
        fromBranchId: branchId || undefined,
      })
      const raw = res.data || []
      setParcels(raw.map(mapApiParcel))

      if (res.meta) {
        setTotalCount(res.meta.total)
        setTotalPages(res.meta.lastPage)
      }
      if (res.statusCounts) {
        setStatusCounts(res.statusCounts)
      }
    } catch (err) {
      console.error("Failed to fetch parcels:", err)
      setError(err instanceof Error ? err.message : "Failed to load parcels")
      setParcels([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.status, filters.branch, filters.merchant])

  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  const filteredData = parcels

  const counts = {
    all: statusCounts.all,
    transit: statusCounts.in_transit,
    pending: statusCounts.pending,
    received: statusCounts.received,
    cancelled: statusCounts.cancelled,
    returned: statusCounts.returned,
  }

  const clearFilters = () => {
    setFilters({ status: "all", search: "", branch: "", merchant: "" })
    setPage(1)
  }

  const updateFilters = (updates: Partial<Filters>) => {
    if (updates.status && updates.status !== filters.status) setPage(1)
    if (updates.search !== undefined && updates.search !== filters.search) setPage(1)
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const exportConfig: ExportConfig = {
    title: "Parcels Report",
    subtitle: `${totalCount} parcels · ${counts.transit} in transit · ${counts.received} received`,
    filename: "sonichoice-parcels",
    columns: [
      { header: "Parcel ID", key: "id", width: 16 },
      { header: "Merchant", key: "merchant", width: 22 },
      { header: "From", key: "from", width: 18 },
      { header: "To", key: "to", width: 18 },
      { header: "Status", key: "status", width: 12 },
      { header: "Size", key: "size", width: 10 },
      { header: "Date Sent", key: "dateSent", width: 14 },
      { header: "Date Received", key: "dateReceived", width: 14 },
    ],
    rows: parcels.map((p) => ({
      id: p.id,
      merchant: p.client,
      from: p.from,
      to: p.to,
      status: p.status,
      size: p.size,
      dateSent: p.dateSent || "",
      dateReceived: p.dateReceived || "",
    })),
  }

  // Fetch branches and merchants for filter dropdowns
  useEffect(() => {
    getBranches().then(branches => {
      setAllBranches(branches.map(b => ({ id: b.id, name: b.name })))
    }).catch(() => {})

    getMerchants().then(res => {
      setAllMerchants((res.data || []).map(m => ({ id: m.id, name: m.name })))
    }).catch(() => {})
  }, [])

  // Handle parcelId query param (from dashboard click)
  useEffect(() => {
    if (hasAppliedParams.current || loading || parcels.length === 0) return

    const parcelId = searchParams.get("parcelId")
    if (parcelId) {
      hasAppliedParams.current = true

      // Try to find in current list first
      const match = parcels.find(p => p.apiId === parcelId)
      if (match) {
        setSelectedParcel(match)
      } else {
        // Fetch directly if not on current page
        getParcel(parcelId)
          .then((full) => setSelectedParcel(mapApiParcel(full)))
          .catch(() => {})
      }

      // Clean URL params without reload
      router.replace("/parcels", { scroll: false })
    }
  }, [loading, parcels, searchParams])

  return (
    <div className='flex flex-col gap-6'>

        <PageHeader
            headerText={`${totalCount} parcels`}
            mainText={'Parcels'}
            subText={`${counts.transit} in transit · ${counts.received} received`}
            loading={loading}
            button1="Export"
            button1Icon={<Download/>}
            onButton1={() => setShowExportPreview(true)}
            button2="Log Parcel"
            button2Icon={<Plus/>}
            onButton2={()=> setOpenForm(true)}
        />

        <div className="">
          <StatusPillsContainer
            counts={counts}
            onChange={(status) => updateFilters({ status })}
            activeStatus={filters.status}
            disabled={loading}
          />

          <FilterBar
            filters={filters}
            setFilters={setFilters}
            total={filteredData.length}
            onChange={(f) => updateFilters(f)}
            filterConfigs={[
              {
                label: "Branch",
                key: "branch",
                options: allBranches.map(b => ({ value: b.name, label: b.name })),
              },
              {
                label: "Merchant",
                key: "merchant",
                options: allMerchants.map(m => ({ value: m.name, label: m.name })),
              },
            ]}
            resetKeys={["search", "branch", "merchant"]}
            disabled={loading}
          />
        </div>

        {loading ? (
          <ParcelTableSkeleton />
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchParcels} />
        ) : (
          <ParcelTable
            data={filteredData} setSelectedParcel={setSelectedParcel} onClearFilters={clearFilters}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        <DetailPanel
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onUpdated={() => {
            setSelectedParcel(null)
            fetchParcels()
          }}
        />

        <ParcelFormPanel
          isOpen={openForm}
          onClose={(didCreate) => {
            setOpenForm(false)
            if (didCreate) fetchParcels()
          }}
          parcels={parcels}
          onBulkTransfer={(ids, toBranch) => {
            console.log("BULK TRANSFER:", { parcelIds: ids, toBranch });
          }}
        />

        <Overlay
          isOpen={openForm}
          onClose={() => setOpenForm(false)}
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

function ParcelTableSkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-200">
            {["Parcel ID", "Merchant", "Route", "Current Location", "Size", "Status", "Date In"].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-gray-400 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-3 py-3"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-14 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-5 w-16 bg-gray-100 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { Suspense } from "react"

export default function ParcelPageWrapper() {
  return (
    <Suspense>
      <ParcelPage />
    </Suspense>
  )
}

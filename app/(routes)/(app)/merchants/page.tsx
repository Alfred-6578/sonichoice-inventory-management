'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import MerchantGrid from '@/components/merchants/MerchantGrid'
import MerchantDetailPanel from '@/components/merchants/MerchantDetailPanel'
import PageHeader from '@/components/ui/PageHeader'
import FilterBar from '@/components/ui/FilterBar'
import Overlay from '@/components/ui/Overlay'
import MerchantFormPanel from '@/components/merchants/MerchantFormPanel'
import { getMerchants, exportMerchants, ApiMerchant } from '@/lib/merchants'
import { MerchantProfile } from '@/types/merchants'
import { Plus, Download } from 'lucide-react'

type MerchantFilters = {
  search: string
  status: string
}

function mapApiMerchant(m: ApiMerchant): MerchantProfile {
  const initials = (m.name || "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const products = (m.products || []).map((p) => {
    const stocks = (p.stocks || []).map((s) => ({
      branchName: s.branch?.name || "Unknown",
      quantity: s.quantity || 0,
    }))
    return {
      id: p.id,
      trackingId: p.trackingId || p.id.slice(0, 8),
      name: p.name,
      description: p.description || "",
      totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0),
      stocks,
    }
  })

  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0)

  return {
    id: m.id,
    name: m.name,
    av: initials,
    color: m.color || "#374151",
    contact: m.name,
    phone: m.phone || "",
    email: m.email || "",
    status: (m.status?.toLowerCase() || "active") as "active" | "inactive" | "suspended",
    joinDate: m.createdAt || "",
    totalProducts: products.length,
    totalStock,
    pendingOrders: 0,
    averageRating: 0,
    products,
  }
}

export default function MerchantsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
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
      await exportMerchants(format)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }
  const [merchants, setMerchants] = useState<MerchantProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MerchantFilters>({
    search: '',
    status: 'all',
  })

  const fetchMerchants = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMerchants({
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status.toUpperCase() : undefined,
      })
      console.log(res);
      
      setMerchants((res.data || []).map(mapApiMerchant))
    } catch (err) {
      console.error("Failed to fetch merchants:", err)
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.status])

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  const selectedMerchant = merchants.find(m => m.id === selectedId) || null
  const activeMerchants = merchants.filter(m => m.status === 'active').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headerText={`Network · ${merchants.length} partners`}
        mainText="Merchants"
        subText={`${activeMerchants} active merchants`}
        loading={loading}
        button1="Export"
        button1Icon={<Download size={16} />}
        onButton1={() => setShowExportMenu(!showExportMenu)}
        button2="Add Merchant"
        button2Icon={<Plus size={16} />}
        onButton2={() => setFormOpen(true)}
      />

      {/* Export dropdown */}
      <div ref={exportRef} className="relative w-full inline-block self-start -mt-2">
        {showExportMenu && (
          <div className="absolute max-md:left-0 -top-15 xsm:-top-3 md:-top-8 md:right-4 mt-1 bg-white border border-border rounded-lg shadow-lg z-20">
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
        total={merchants.length}
        filterConfigs={[
          {
            label: 'Status',
            key: 'status',
            options: [
              { value: 'all', label: 'All Merchants' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]
          }
        ]}
        resetKeys={["search", "status"]}
        disabled={loading}
      />

      {loading ? (
        <MerchantGridSkeleton />
      ) : (
        <MerchantGrid
          merchants={merchants}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      )}

      {selectedMerchant && (
        <MerchantDetailPanel
          merchant={selectedMerchant}
          onClose={() => setSelectedId(null)}
          onUpdated={() => {
            setSelectedId(null)
            fetchMerchants()
          }}
        />
      )}

      <Overlay isOpen={formOpen} onClose={() => setFormOpen(false)} />
      {formOpen && (
        <MerchantFormPanel
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={() => {
            setFormOpen(false)
            fetchMerchants()
          }}
        />
      )}
    </div>
  )
}

function MerchantGridSkeleton() {
  return (
    <div className="flex-1 py-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tny:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-[14px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-raised border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div>
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import MerchantGrid from '@/components/merchants/MerchantGrid'
import MerchantDetailPanel from '@/components/merchants/MerchantDetailPanel'
import PageHeader from '@/components/ui/PageHeader'
import FilterBar from '@/components/ui/FilterBar'
import Overlay from '@/components/ui/Overlay'
import MerchantFormPanel from '@/components/merchants/MerchantFormPanel'
import { getMerchants, ApiMerchant } from '@/lib/merchants'
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
    totalProducts: Array.isArray(m.products) ? m.products.length : 0,
    totalStock: 0,
    pendingOrders: 0,
    averageRating: 0,
  }
}

export default function MerchantsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
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
        subText={loading ? 'Loading...' : `${activeMerchants} active merchants`}
        button1="Export"
        button2="Add Merchant"
        button1Icon={<Download size={16} />}
        button2Icon={<Plus size={16} />}
        onButton2={() => setFormOpen(true)}
      />

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

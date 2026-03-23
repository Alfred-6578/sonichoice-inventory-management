'use client'

import { useState, useMemo } from 'react'
import MerchantGrid from '@/components/merchants/MerchantGrid'
import MerchantDetailPanel from '@/components/merchants/MerchantDetailPanel'
import PageHeader from '@/components/ui/PageHeader'
import FilterBar from '@/components/ui/FilterBar'
import Overlay from '@/components/ui/Overlay'
import MerchantFormPanel from '@/components/merchants/MerchantFormPanel'
import { MERCHANTS } from '@/data/merchantsData'
import { MerchantFilters } from '@/types/merchants'
import { Plus, Download } from 'lucide-react'

export default function MerchantsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [filters, setFilters] = useState<MerchantFilters>({
    search: '',
    status: 'all',
    category: ''
  })

  const selectedMerchant = MERCHANTS.find(m => m.id === selectedId) || null

  const filteredMerchants = useMemo(() => {
    return MERCHANTS.filter(m => {
      if (filters.search && !m.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.status !== 'all' && m.status !== filters.status) return false
      return true
    })
  }, [filters])

  const activeMerchants = MERCHANTS.filter(m => m.status === 'active').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headerText="Network · 6 partners"
        mainText="Merchants"
        subText={`${activeMerchants} active merchants`}
        button1="Export"
        button2="Add Merchant"
        button1Icon={<Download size={16} />}
        button2Icon={<Plus size={16} />}
        onButton2={() => setFormOpen(true)}
      />

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        total={filteredMerchants.length}
        filterConfigs={[
          {
            label: 'Status',
            key: 'status',
            options: [
              { value: 'all', label: 'All Merchants' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' }
            ]
          }
        ]}
      />

      <MerchantGrid
        merchants={filteredMerchants}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />

      {selectedMerchant && (
        <MerchantDetailPanel
          merchant={selectedMerchant}
          onClose={() => setSelectedId(null)}
        />
      )}

      <Overlay isOpen={formOpen} onClose={() => setFormOpen(false)} />
      {formOpen && (
        <MerchantFormPanel
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={(data) => {
            console.log('New merchant:', data)
            setFormOpen(false)
          }}
        />
      )}
    </div>
  )
}
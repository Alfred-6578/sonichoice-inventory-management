import { MerchantProfile } from '@/types/merchants'
import MerchantCard from './MerchantCard'
import { Store } from 'lucide-react'

interface MerchantGridProps {
  merchants: MerchantProfile[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}

export default function MerchantGrid({ merchants, onSelect, selectedId }: MerchantGridProps) {
  if (merchants.length === 0) {
    return (
      <div className="flex-1 py-5">
        <div className="text-center py-14 bg-white border border-border rounded-xl">
          <div className="w-11 h-11 mx-auto mb-3 rounded-lg bg-surface border border-border flex items-center justify-center">
            <Store className="w-5 h-5 text-ink-subtle" />
          </div>
          <div className="text-ink font-medium">No merchants found</div>
          <div className="text-ink-subtle text-sm">
            Try adjusting your filters or add a new merchant
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 py-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tny:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-[14px]">
        {merchants.map((merchant) => (
          <MerchantCard
            key={merchant.id}
            merchant={merchant}
            onSelect={onSelect || (() => {})}
            isSelected={selectedId === merchant.id}
          />
        ))}
      </div>
    </div>
  )
}
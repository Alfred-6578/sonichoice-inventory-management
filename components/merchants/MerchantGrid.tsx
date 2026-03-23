import { MerchantProfile } from '@/types/merchants'
import MerchantCard from './MerchantCard'

interface MerchantGridProps {
  merchants: MerchantProfile[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}

export default function MerchantGrid({ merchants, onSelect, selectedId }: MerchantGridProps) {
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
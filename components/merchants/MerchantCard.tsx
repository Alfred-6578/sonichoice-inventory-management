import { MerchantProfile } from '@/types/merchants'
import StatusBadge from '@/components/ui/StatusBadge'
import { Phone, Mail, Package, Warehouse } from 'lucide-react'

interface MetricProps {
  label: string
  value: string | number
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-ink/60">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  )
}

interface MerchantCardProps {
  merchant: MerchantProfile
  onSelect: (id: string) => void
  isSelected?: boolean
}

export default function MerchantCard({ merchant, onSelect, isSelected }: MerchantCardProps) {
  return (
    <div
      onClick={() => onSelect(merchant.id)}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-raised'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: merchant.color }}
        >
          {merchant.av}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate">{merchant.name}</div>
          <StatusBadge status={merchant.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <Metric label="Products" value={merchant.totalProducts} />
        <Metric label="Stock" value={merchant.totalStock.toLocaleString()} />
      </div>

      {/* Contact Information */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="text-xs text-ink/60 font-medium">Contact</div>
        <div className="text-sm text-ink">{merchant.contact}</div>
        <div className="flex items-center gap-2 text-xs text-ink/70">
          <span className="font-mono">{merchant.phone}</span>
        </div>
        <div className="text-xs text-ink/70 truncate font-mono">
          {merchant.email}
        </div>
      </div>
    </div>
  )
}
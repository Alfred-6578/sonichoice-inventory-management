import { MerchantProfile } from '@/types/merchants'
import { INVENTORY } from '@/data/inventoryData'
import { Syne } from 'next/font/google'
import { X, Phone, Mail, Star } from 'lucide-react'

interface MerchantDetailPanelProps {
  merchant: MerchantProfile | null
  onClose: () => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

export default function MerchantDetailPanel({ merchant, onClose }: MerchantDetailPanelProps) {
  if (!merchant) return null

  const merchantProducts = INVENTORY.filter(item => item.merchant.name === merchant.name)

  const formatMoney = (amount: number) => `₦${amount.toLocaleString()}`

  return (
    <div className="sm:w-[380px] w-full h-full bg-surface-raised border-l border-border flex flex-col fixed top-0 z-50 right-0">
      {/* HEADER */}
      <div className="p-[14px_18px] border-b border-border flex items-center gap-[10px]">
        <button
          onClick={onClose}
          className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-ink-subtle hover:bg-surface transition"
        >
          <X size={16} />
        </button>

        <div className="flex-1">
          <div className="text-[9px] font-m text-ink-subtle uppercase tracking-[0.8px]">
            Merchant
          </div>
          <div className={`font-d text-[15px] font-bold text-ink ${syne.className}`}>
            {merchant.name}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Star size={12} className="text-amber" />
          <span className="text-xs font-m text-ink">{merchant.averageRating}</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        {/* METRICS */}
        <div className="grid grid-cols-2 border-b border-border">
          <div className="p-4 border-r border-border">
            <div className="text-xs text-ink-subtle">Total Products</div>
            <div className="text-lg font-bold text-ink">{merchant.totalProducts}</div>
          </div>
          <div className="p-4">
            <div className="text-xs text-ink-subtle">Total Stock</div>
            <div className="text-lg font-bold text-ink">{merchant.totalStock.toLocaleString()}</div>
          </div>

          <div className="p-4 border-t">
            <div className="text-xs text-ink-subtle">Pending Orders</div>
            <div className="text-lg font-bold text-ink">{merchant.pendingOrders}</div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink mb-3">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ background: merchant.color }}
              >
                {merchant.av}
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{merchant.contact}</div>
                <div className="text-xs text-ink-subtle">Primary Contact</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-ink-subtle" />
              <span className="font-mono text-ink-muted/80">{merchant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-ink-subtle" />
              <span className="font-mono text-ink-muted/80">{merchant.email}</span>
            </div>
          </div>
        </div>

        {/* PORTFOLIO */}
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink mb-3">Product Portfolio ({merchantProducts.length})</h3>
          <div className="space-y-3">
            {merchantProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-2 rounded border border-border bg-surface">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{product.name}</div>
                  <div className="text-xs text-ink-subtle">{product.category} • {product.totalQty} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PERFORMANCE */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-ink mb-3">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-subtle">Join Date</span>
              <span className="font-mono">{new Date(merchant.joinDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-subtle">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-m ${
                merchant.status === 'active' ? 'bg-green-100 text-green-800' :
                merchant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {merchant.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-subtle">Average Rating</span>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber fill-amber" />
                <span>{merchant.averageRating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
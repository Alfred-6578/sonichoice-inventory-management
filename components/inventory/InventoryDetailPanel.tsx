import { InventoryItem } from "@/types/inventory"
import { BRANCHES_LIST } from "@/data/inventoryData"
import { X } from "lucide-react"
import { DM_Mono, Syne } from "next/font/google"

const syne = Syne({
    variable: "--font-syne",
})

const dm_mono = DM_Mono({
    variable:"--font-dm_mono",
    subsets:["latin"],
    weight: ["300","400","500"]
})

export default function InventoryDetailPanel({
  item,
  onClose
}: {
  item: InventoryItem | null
  onClose: () => void
}) {

  if (!item) return null

  const totalQty = item.totalQty
  const dispatched = item.history.filter(h => h.type === 'out').reduce((s, h) => {
    const m = h.label.match(/(\d+)/)
    return s + (m ? parseInt(m[1]) : 0)
  }, 0)
  const sClass = totalQty === 0 ? 'red' : totalQty <= item.lowAlert ? 'amber' : 'green'

  const branchRows = Object.entries(item.stock)
    .filter(([, qty]) => qty != null)
    .map(([branch, qty]) => {
      const color = BRANCHES_LIST.find(b => b.name === branch)?.color || '#374151'
      const pct = totalQty > 0 ? (qty ? qty / totalQty : 0) * 100 : 0
      return (
        <div key={branch} className="flex items-center gap-2.5 py-2.5 border-b border-gray-200 last:border-b-0">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-delivered"></div>
          <div className="text-sm font-medium text-ink flex-1 min-w-0 truncate">{branch}</div>
          <div className="w-15 h-0.5 bg-gray-200 rounded flex-shrink-0">
            <div className="h-full rounded bg-delivered" style={{ width: `${pct}%`}}></div>
          </div>
          <div className="font-mono text-xs font-medium text-gray-700 min-w-[32px] text-right">{qty ? qty.toLocaleString() : '0'}</div>
          <div className="font-mono text-xs text-gray-400 min-w-[28px]">{item.unit}</div>
        </div>
      )
    })

  const actRows = item.history.slice().reverse().map(h => {
    const iconBg = h.type === 'in' ? 'bg-green-50 text-green-600' : h.type === 'out' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
    const icon = h.type === 'in' ? (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
    ) : h.type === 'out' ? (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    ) : (
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M8 16H4l6 6 6-6h-4V4H8v12zm13-9l-6-6-6 6h4v12h4V7h4z"/></svg>
    )
    return (
      <div key={h.date + h.label} className="flex items-start gap-2.5 py-2.5 border-b border-gray-200 last:border-b-0">
        <div className={`w-6.5 h-6.5 rounded flex-shrink-0 flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-900 leading-relaxed">{h.label}</div>
          <div className="text-xs text-gray-500 mt-0.5 font-mono">{h.branch} · {new Date(h.date).toLocaleDateString()}</div>
        </div>
      </div>
    )
  })

  return (
    <div className="fixed right-0 top-0 sm:w-100 w-full z-50 h-full bg-white border-l border-gray-200 flex flex-col">

      <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-start gap-2.5 flex-shrink-0">
        <button 
          onClick={onClose}
          className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-gray-400 flex-shrink-0 transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="font-mono text-xs text-gray-400 px-1.75 py-0.5 bg-gray-100 border border-gray-200 rounded inline-block mb-0.75">{item.sku}</div>
          <div className={`font-display capitalize text-3.75 font-bold text-gray-900 letter-spacing-tighter leading-5 ${syne.className}`}>{item.name}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        <div className="px-4.5 py-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-3">
            <div className="px-3.5 py-3 text-center border-r border-gray-200">
              <div className={`font-display text-xl font-bold letter-spacing-tighter leading-5 ${
                sClass === 'red' ? 'text-red-600' : sClass === 'amber' ? 'text-amber-600' : 'text-green-600'
              } ${syne.className}`}>
                {totalQty.toLocaleString()}
              </div>
              <div className={`font-mono text-[10px] text-gray-400 uppercase letter-spacing-wider mt-0.75 ${dm_mono.className}`}>Total Stock</div>
            </div>
            <div className="px-3.5 py-3 text-center border-r border-gray-200">
              <div className={`font-display text-xl font-bold text-amber-600 letter-spacing-tighter leading-5 ${syne.className}`}>
                {dispatched.toLocaleString()}
              </div>
              <div className={`font-mono text-[10px] text-gray-400 uppercase letter-spacing-wider mt-0.75 ${dm_mono.className}`}>Dispatched</div>
            </div>
            <div className="px-3.5 py-3 text-center">
              <div className={`font-display text-xl font-bold text-gray-900 letter-spacing-tighter leading-5 ${syne.className}`}>
                {item.lowAlert}
              </div>
              <div className={`font-mono text-[10px] text-gray-400 uppercase letter-spacing-wider mt-0.75 ${dm_mono.className}`}>Low Alert</div>
            </div>
          </div>
          <div className="font-mono text-xs text-gray-400 uppercase letter-spacing-wider mb-2.5">Stock by branch</div>
          <div>{branchRows}</div>
        </div>

        <div className="px-4.5 py-4 border-b border-gray-200">
          <div className="font-mono text-xs text-gray-400 uppercase letter-spacing-wider mb-2.5">Product Info</div>
          <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-3.25 py-2.25 border-b border-gray-200">
              <span className="text-xs text-gray-500">SKU</span>
              <span className="text-xs text-gray-900 font-medium font-mono">{item.sku}</span>
            </div>
            <div className="flex justify-between items-center px-3.25 py-2.25 border-b border-gray-200">
              <span className="text-xs text-gray-500">Category</span>
              <span className="text-xs text-gray-900 font-medium">{item.category}</span>
            </div>
            <div className="flex justify-between items-center px-3.25 py-2.25 border-b border-gray-200">
              <span className="text-xs text-gray-500">Unit</span>
              <span className="text-xs text-gray-900 font-medium">{item.unit}</span>
            </div>
            <div className="flex justify-between items-center px-3.25 py-2.25 border-b border-gray-200">
              <span className="text-xs text-gray-500">Date received</span>
              <span className="text-xs text-gray-900 font-medium font-mono">{new Date(item.dateIn).toLocaleDateString()}</span>
            </div>
            {item.notes && (
              <div className="flex justify-between items-center px-3.25 py-2.25">
                <span className="text-xs text-gray-500">Notes</span>
                <span className="text-xs text-amber-600 font-medium max-w-40 text-right whitespace-normal">{item.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4.5 py-4 border-b border-gray-200">
          <div className="font-mono text-xs text-gray-400 uppercase letter-spacing-wider mb-2.5">Merchant</div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg px-3.5 py-3 flex items-center gap-3">
            <div 
              className="w-9.5 h-9.5 rounded-2.25 flex items-center justify-center font-display text-3.25 font-bold text-white flex-shrink-0"
              style={{ background: item.merchant.color }}
            >
              {item.merchant.av}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-900">{item.merchant.name}</div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">{item.merchant.contact}</div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">{item.merchant.phone}</div>
            </div>
          </div>
        </div>

        <div className="px-4.5 py-4">
          <div className="font-mono text-xs text-gray-400 uppercase letter-spacing-wider mb-2.5">Movement History</div>
          <div>{actRows}</div>
        </div>

      </div>

    </div>
  )
}
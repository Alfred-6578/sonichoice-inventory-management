"use client"

import { X } from "lucide-react"
import { Syne } from "next/font/google"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
})

export interface ProductListItem {
  id: string
  trackingId: string
  name: string
  description: string
  stocks?: { branchName: string; quantity: number }[]
  quantity?: number
  lowStockAlert?: number
  totalStock?: number
  merchantName?: string
  merchantColor?: string
}

interface ProductListModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  products: ProductListItem[]
  variant: "merchant" | "branch"
}

const PAGE_SIZE = 30

export default function ProductListModal({
  isOpen,
  onClose,
  title,
  subtitle,
  products,
  variant,
}: ProductListModalProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search) return products
    const s = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.trackingId.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(s))
    )
  }, [products, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page when search changes
  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[70]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl border border-border shadow-2xl flex flex-col w-full max-w-[93%] xl:max-w-[80%] max-h-[95vh] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b max-sm:flex-col border-border flex sm:items-center gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              <div className={`text-lg font-bold text-ink ${syne.className}`}>
                {title}
              </div>
              {subtitle && (
                <div className="text-xs text-ink-subtle mt-0.5">{subtitle}</div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg w-full sm:w-56 focus-within:border-border-strong">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-ink-subtle shrink-0">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent outline-none w-full text-xs text-ink placeholder:text-ink-subtle"
                />
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {paginated.length === 0 ? (
              <div className="text-center py-10 text-ink-subtle text-sm">
                {search ? "No products match your search" : "No products found"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {paginated.map((p, idx) => (
                  <div
                    key={p.id + idx}
                    onClick={() => {
                      onClose()
                      router.push(`/inventory?search=${encodeURIComponent(p.name)}&productId=${p.id}`)
                    }}
                    className="border border-border rounded-lg overflow-hidden hover:border-border-strong transition cursor-pointer"
                  >
                    {/* Product header */}
                    <div className="px-3.5 py-2.5 flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.merchantName && (
                            <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: p.merchantColor || "#374151" }}
                              />
                              {p.merchantName}
                            </span>
                          )}
                          {p.description && (
                            <span className="text-[11px] text-ink-subtle truncate">
                              {p.merchantName ? "·" : ""} {p.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-ink-subtle shrink-0">
                        {p.trackingId}
                      </span>
                    </div>

                    {/* Stock info */}
                    {variant === "merchant" ? (
                      <div className="border-t border-border bg-gray-50/50 px-3.5 py-2">
                        {p.stocks && p.stocks.length > 0 ? (
                          <div className="space-y-1">
                            {p.stocks.map((s, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-[11px] text-ink-muted">{s.branchName}</span>
                                <span className="text-[11px] font-mono font-medium text-ink">{s.quantity}</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                              <span className="text-[11px] font-medium text-ink-muted">Total</span>
                              <span className="text-[11px] font-mono font-bold text-ink">{p.totalStock} units</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-subtle">No stock assigned</span>
                        )}
                      </div>
                    ) : (
                      <div className="border-t border-border bg-gray-50/50 px-3.5 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-medium text-ink">{p.quantity} units</span>
                          {p.lowStockAlert != null && p.quantity != null && p.quantity <= p.lowStockAlert && p.lowStockAlert > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                              Low stock
                            </span>
                          )}
                        </div>
                        {p.lowStockAlert != null && (
                          <span className="text-[10px] text-ink-subtle">Alert: {p.lowStockAlert}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0">
            <span className="text-xs text-ink-subtle">
              {search
                ? `${filtered.length} of ${products.length} products`
                : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </span>

            <div className="flex items-center gap-2">
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2.5 py-1 text-xs border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-ink-muted">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-2.5 py-1 text-xs border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
                  >
                    Next
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

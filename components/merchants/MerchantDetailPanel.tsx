"use client"

import { MerchantProfile } from '@/types/merchants'
import { Syne } from 'next/font/google'
import { X, Phone, Mail, Trash2, Pencil } from 'lucide-react'
import { useState } from 'react'
import { deleteMerchant, updateMerchant } from '@/lib/merchants'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import ProductListModal, { ProductListItem } from '@/components/ui/ProductListModal'

interface MerchantDetailPanelProps {
  merchant: MerchantProfile | null
  onClose: () => void
  onUpdated?: () => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

const colorOptions = [
  '#2563eb', '#d97706', '#059669', '#0891b2', '#4f46e5', '#7c3aed',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#33FF57', '#FF5733'
]

export default function MerchantDetailPanel({ merchant, onClose, onUpdated }: MerchantDetailPanelProps) {
  const router = useRouter()
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editColor, setEditColor] = useState("")
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")

  if (!merchant) return null

  const displayProducts = merchant.products

  const startEdit = () => {
    setEditName(merchant.name)
    setEditEmail(merchant.email)
    setEditPhone(merchant.phone)
    setEditColor(merchant.color)
    setEditStatus(merchant.status === 'active' ? 'ACTIVE' : 'INACTIVE')
    setError("")
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      await updateMerchant(merchant.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        color: editColor,
        status: editStatus,
      })
      setEditing(false)
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError("")
    try {
      await deleteMerchant(merchant.id)
      setConfirmDelete(false)
      onClose()
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

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

        {!editing && (
          <>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-red-50 hover:text-red-500 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={startEdit}
              className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-surface transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">

        {/* EDIT FORM */}
        {editing && (
          <div className="px-4 py-4 border-b border-border space-y-3">
            <div className="text-[9px] font-m text-ink-subtle uppercase tracking-wider">Edit Merchant</div>
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
            )}
            <Input id="edit-name" label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} size="sm" />
            <Input id="edit-email" label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} size="sm" />
            <Input id="edit-phone" label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} size="sm" />

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${editColor === c ? 'border-ink' : 'border-border'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-ink outline-none focus:border-ink"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg text-white font-bold ${
                  saving ? 'bg-gray-400' : 'bg-ink hover:bg-gray-800'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* METRICS */}
        <div className="grid grid-cols-3 border-b border-border">
          <div className="p-4 border-r border-border text-center">
            <div className="text-lg font-bold text-ink">{merchant.totalProducts}</div>
            <div className="text-[10px] text-ink-subtle uppercase">Products</div>
          </div>
          <div className="p-4 border-r border-border text-center">
            <div className="text-lg font-bold text-ink">{merchant.totalStock.toLocaleString()}</div>
            <div className="text-[10px] text-ink-subtle uppercase">Total Stock</div>
          </div>
          <div className="p-4 text-center">
            <span className={`inline-block px-2 py-1 rounded text-xs font-m ${
              merchant.status === 'active' ? 'bg-green-100 text-green-800' :
              merchant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {merchant.status}
            </span>
            <div className="text-[10px] text-ink-subtle uppercase mt-1">Status</div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="p-4 border-b border-border">
          <h3 className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider mb-3">Contact</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ background: merchant.color }}
              >
                {merchant.av}
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{merchant.contact}</div>
                <div className="text-xs text-ink-subtle">Since {merchant.joinDate ? new Date(merchant.joinDate).toLocaleDateString() : "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-ink-subtle shrink-0" />
              <span className="font-mono text-ink-muted/80 text-xs">{merchant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-ink-subtle shrink-0" />
              <span className="font-mono text-ink-muted/80 text-xs">{merchant.email}</span>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="p-4">
          <h3 className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider mb-3">
            Products ({displayProducts.length})
          </h3>

          {displayProducts.length === 0 ? (
            <div className="text-sm text-ink-subtle py-4 text-center">No products yet</div>
          ) : (
            <div className="space-y-2">
              {displayProducts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/inventory?search=${encodeURIComponent(p.name)}&productId=${p.id}`)}
                  className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-border-strong transition"
                >
                  <div className="px-3 py-2.5 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink truncate">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-ink-subtle truncate">{p.description}</div>
                      )}
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-ink-subtle shrink-0">
                      {p.trackingId}
                    </span>
                  </div>

                  {p.stocks.length > 0 ? (
                    <div className="border-t border-border bg-gray-50/50 px-3 py-2 space-y-1">
                      {p.stocks.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[11px] text-ink-muted">{s.branchName}</span>
                          <span className="text-[11px] font-mono font-medium text-ink">{s.quantity} units</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="text-[11px] font-medium text-ink-muted">Total</span>
                        <span className="text-[11px] font-mono font-bold text-ink">{p.totalStock} units</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-border bg-gray-50/50 px-3 py-2">
                      <span className="text-[11px] text-ink-subtle">No stock assigned</span>
                    </div>
                  )}
                </div>
              ))}

              {displayProducts.length > 3 && (
                <button
                  onClick={() => setShowAllProducts(true)}
                  className="w-full py-2.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-border rounded-lg hover:bg-surface transition"
                >
                  View all {displayProducts.length} products
                </button>
              )}
            </div>
          )}
        </div>

        <ProductListModal
          isOpen={showAllProducts}
          onClose={() => setShowAllProducts(false)}
          title={merchant.name}
          subtitle={`${displayProducts.length} products · ${merchant.totalStock} total units`}
          variant="merchant"
          products={displayProducts.map((p): ProductListItem => ({
            id: p.id,
            trackingId: p.trackingId,
            name: p.name,
            description: p.description,
            stocks: p.stocks,
            totalStock: p.totalStock,
          }))}
        />
      </div>

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 max-w-72 w-full text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">Delete this merchant?</div>
            <div className="text-xs text-gray-500 mb-4">
              &quot;{merchant.name}&quot; will be permanently removed. This cannot be undone.
            </div>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmDelete(false); setError(""); }}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 px-3 py-2 text-xs rounded-lg text-white font-bold ${
                  deleting ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

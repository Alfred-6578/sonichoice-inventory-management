"use client"

import { InventoryItem } from "@/types/inventory"
import { BRANCHES_LIST } from "@/data/inventoryData"
import { X, Pencil, Trash2 } from "lucide-react"
import { DM_Mono, Syne } from "next/font/google"
import { useState, useEffect } from "react"
import { updateProduct, deleteProduct, BranchEntry } from "@/lib/products"
import { getBranches, ApiBranch } from "@/lib/branches"

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
  onClose,
  onUpdated
}: {
  item: InventoryItem | null
  onClose: () => void
  onUpdated?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editBranches, setEditBranches] = useState<{ branchId: string; quantity: number; lowStockAlert: number }[]>([])
  const [allBranches, setAllBranches] = useState<ApiBranch[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setDeleting(true)
    setError("")
    try {
      await deleteProduct(item.id)
      setConfirmDelete(false)
      onClose()
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  const startEdit = async () => {
    setEditName(item.name)
    setEditDesc(item.category)
    setEditNotes(item.notes)
    // Build branch entries from current stock
    const entries = Object.entries(item.stock).map(([name, qty]) => ({
      branchId: name, // will be resolved to id below
      quantity: qty ?? 0,
      lowStockAlert: 10,
    }))
    setEditBranches(entries)
    setError("")
    setEditing(true)

    // Fetch branches to get IDs
    try {
      const branches = await getBranches()
      setAllBranches(branches)
      // Resolve branch names to IDs
      const resolved = entries.map((e) => {
        const match = branches.find((b) => b.name === e.branchId)
        return { ...e, branchId: match?.id || e.branchId }
      })
      setEditBranches(resolved)
    } catch {
      // Continue with names if fetch fails
    }
  }

  const handleAddBranch = () => {
    const usedIds = editBranches.map((e) => e.branchId)
    const available = allBranches.find((b) => !usedIds.includes(b.id))
    if (available) {
      setEditBranches([...editBranches, { branchId: available.id, quantity: 0, lowStockAlert: 10 }])
    }
  }

  const handleRemoveBranch = (index: number) => {
    setEditBranches(editBranches.filter((_, i) => i !== index))
  }

  const handleBranchEntryChange = (index: number, field: string, value: string | number) => {
    const updated = [...editBranches]
    updated[index] = { ...updated[index], [field]: value }
    setEditBranches(updated)
  }

  const handleSave = async () => {
    const validBranches = editBranches.filter((b) => b.quantity > 0)
    if (validBranches.length === 0) {
      setError("At least one branch must have quantity > 0")
      return
    }

    setSaving(true)
    setError("")
    try {
      await updateProduct(item.id, {
        name: editName,
        description: editDesc || undefined,
        additionalInfo: editNotes || undefined,
        branches: validBranches,
      })
      setEditing(false)
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

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
        {!editing && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-gray-400 flex-shrink-0 transition-all hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        {!editing && (
          <button
            onClick={startEdit}
            className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-gray-400 flex-shrink-0 transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Edit Form */}
        {editing && (
          <div className="px-4.5 py-4 border-b border-gray-200 space-y-3">
            <div className="font-mono text-xs text-gray-400 uppercase letter-spacing-wider mb-1">Edit Product</div>
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}
            <div>
              <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">Description</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">Additional Info</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-gray-900 resize-none"
              />
            </div>

            {/* Stock by Branch */}
            <div className="font-mono text-[10px] text-gray-400 uppercase mt-2">Stock by branch</div>
            <div className="grid grid-cols-[1fr_60px_60px_24px] gap-1.5 mb-1">
              <span className="font-mono text-[9px] text-gray-400 uppercase">Branch</span>
              <span className="font-mono text-[9px] text-gray-400 uppercase">Qty</span>
              <span className="font-mono text-[9px] text-gray-400 uppercase">Alert</span>
              <span />
            </div>
            {editBranches.map((entry, index) => (
              <div key={index} className="grid grid-cols-[1fr_60px_60px_24px] gap-1.5">
                <select
                  value={entry.branchId}
                  onChange={(e) => handleBranchEntryChange(index, 'branchId', e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-gray-900"
                >
                  {allBranches.map((b) => (
                    <option key={b.id} value={b.id} disabled={editBranches.some((e, i) => i !== index && e.branchId === b.id)}>
                      {b.name}
                    </option>
                  ))}
                  {/* Keep current value if branches haven't loaded */}
                  {!allBranches.find((b) => b.id === entry.branchId) && (
                    <option value={entry.branchId}>{entry.branchId}</option>
                  )}
                </select>
                <input
                  type="number"
                  min="0"
                  value={entry.quantity}
                  onChange={(e) => handleBranchEntryChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-gray-900"
                />
                <input
                  type="number"
                  min="0"
                  value={entry.lowStockAlert}
                  onChange={(e) => handleBranchEntryChange(index, 'lowStockAlert', parseInt(e.target.value) || 0)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-gray-900"
                />
                {editBranches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBranch(index)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {allBranches.some((b) => !editBranches.some((e) => e.branchId === b.id)) && (
              <button
                type="button"
                onClick={handleAddBranch}
                className="font-mono text-[10px] text-amber-600 underline hover:text-amber-700 transition-colors"
              >
                + Add another branch
              </button>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg text-white font-bold ${
                  saving ? 'bg-gray-400' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        <div className="px-4.5 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-3">
            <div className="px-3.5 py-3 text-center border-r border-gray-200">
              <div className={`font-display text-xl font-bold letter-spacing-tighter leading-5 ${
                sClass === 'red' ? 'text-red-600' : sClass === 'amber' ? 'text-amber-600' : 'text-green-600'
              } ${syne.className}`}>
                {totalQty.toLocaleString()}
              </div>
              <div className={`font-mono text-[10px] text-gray-400 uppercase letter-spacing-wider mt-0.75 ${dm_mono.className}`}>Total Stock</div>
            </div>
            {/* <div className="px-3.5 py-3 text-center border-r border-gray-200">
              <div className={`font-display text-xl font-bold text-amber-600 letter-spacing-tighter leading-5 ${syne.className}`}>
                {dispatched.toLocaleString()}
              </div>
              <div className={`font-mono text-[10px] text-gray-400 uppercase letter-spacing-wider mt-0.75 ${dm_mono.className}`}>Dispatched</div>
            </div> */}
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
              <span className="text-xs text-gray-500">Tracking ID</span>
              <span className="text-xs text-gray-900 font-medium font-mono">{item.sku}</span>
            </div>
            {/* <div className="flex justify-between items-center px-3.25 py-2.25 border-b border-gray-200">
              <span className="text-xs text-gray-500">Category</span>
              <span className="text-xs text-gray-900 font-medium">{item.category}</span>
            </div> */}
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

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 max-w-72 w-full text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">Delete this product?</div>
            <div className="text-xs text-gray-500 mb-4">
              &quot;{item.name}&quot; will be permanently removed. This action cannot be undone.
            </div>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
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
                  deleting ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
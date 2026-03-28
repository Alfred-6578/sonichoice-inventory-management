"use client"

import { MerchantProfile } from '@/types/merchants'
import { Syne } from 'next/font/google'
import { X, Phone, Mail, Trash2, Pencil } from 'lucide-react'
import { useState } from 'react'
import { deleteMerchant, updateMerchant } from '@/lib/merchants'
import Input from '@/components/ui/Input'

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
        <div className="grid grid-cols-2 border-b border-border">
          <div className="p-4 border-r border-border">
            <div className="text-xs text-ink-subtle">Total Products</div>
            <div className="text-lg font-bold text-ink">{merchant.totalProducts}</div>
          </div>
          <div className="p-4">
            <div className="text-xs text-ink-subtle">Status</div>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-m ${
              merchant.status === 'active' ? 'bg-green-100 text-green-800' :
              merchant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {merchant.status}
            </span>
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

        {/* DETAILS */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-ink mb-3">Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-subtle">Join Date</span>
              <span className="font-mono">{merchant.joinDate ? new Date(merchant.joinDate).toLocaleDateString() : "—"}</span>
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
          </div>
        </div>
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

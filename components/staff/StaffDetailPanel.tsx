'use client'

import { StaffMember } from '@/types/staff'
import { X, Phone, Mail, Briefcase, MapPin, Calendar, Pencil } from 'lucide-react'
import { Syne } from 'next/font/google'
import { useEffect, useState } from 'react'
import { updateUser } from '@/lib/users'
import { getBranches } from '@/lib/branches'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface StaffDetailPanelProps {
  staff: StaffMember | null
  onClose: () => void
  onUpdated?: () => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <h3 className="text-sm font-semibold text-ink px-4 py-3 bg-surface">{title}</h3>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-ink/60 flex-shrink-0 mt-1" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink/60 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm text-ink font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function StaffDetailPanel({ staff, onClose, onUpdated }: StaffDetailPanelProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editBranchId, setEditBranchId] = useState("")
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])

  // Reset edit state when staff changes
  useEffect(() => {
    setEditing(false)
    setError("")
  }, [staff?.id])

  // Fetch branches for edit dropdown
  useEffect(() => {
    if (editing && branches.length === 0) {
      getBranches().then((data) => {
        setBranches(data.map(b => ({ id: b.id, name: b.name })))
      }).catch(() => {})
    }
  }, [editing])

  if (!staff) return null

  const startEdit = () => {
    setEditName(staff.name)
    setEditPhone(staff.phone)
    setEditRole(staff.role)
    setEditBranchId(staff.branchId || "")
    setError("")
    setEditing(true)
  }

  const handleSave = async () => {
    if (!editName.trim()) {
      setError("Name is required.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await updateUser(staff.id, {
        name: editName,
        phone: editPhone || undefined,
        role: editRole as "USER" | "ADMIN",
        branchId: editBranchId || undefined,
      })
      setEditing(false)
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sm:w-[420px] w-full bg-surface-raised border-l border-border flex flex-col fixed top-0 z-50 right-0 h-screen shadow-2xl">
      {/* HEADER */}
      <div className="px-4 py-4 border-b border-border flex items-start justify-between gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-ink-subtle uppercase tracking-wider mb-1">Staff Member</div>
          <div className={`text-lg font-bold text-ink ${syne.className}`}>{staff.name}</div>
        </div>
        <div className="flex items-center gap-1">
          {!editing && (
            <button
              onClick={startEdit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* EDIT FORM */}
      {editing && (
        <div className="px-4 py-4 border-b border-border space-y-3">
          <div className="text-[9px] font-mono text-ink-subtle uppercase tracking-wider">Edit User</div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
          )}

          <Input
            id="edit-name"
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            size="sm"
          />

          <Input
            id="edit-phone"
            label="Phone"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="+234..."
            size="sm"
          />

          <div>
            <label className="block text-xs text-[#9ca3af] uppercase tracking-wide mb-1.5">Role</label>
            <Select
              id="edit-role"
              size="sm"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              options={[
                { value: "USER", label: "Staff" },
                { value: "ADMIN", label: "Admin" },
              ]}
              placeholder="— Select —"
            />
          </div>

          <div>
            <label className="block text-xs text-[#9ca3af] uppercase tracking-wide mb-1.5">Branch</label>
            <Select
              id="edit-branch"
              size="sm"
              value={editBranchId}
              onChange={(e) => setEditBranchId(e.target.value)}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              placeholder="— Select —"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setEditing(false); setError(""); }}
              className="px-3 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg text-white font-bold ${
                saving ? "bg-gray-400" : "bg-ink hover:bg-gray-800"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        {/* METRICS */}
        <div className="grid grid-cols-2 border-b border-border bg-surface/50">
          <div className="p-3 border-r border-border text-center">
            <div className="text-xs text-ink/60 mb-1">Role</div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              staff.role === "ADMIN"
                ? "bg-amber/10 text-amber-700 border border-amber/30"
                : "bg-surface border border-border text-ink-muted"
            }`}>
              {staff.role === "ADMIN" ? "Admin" : "Staff"}
            </span>
          </div>
          <div className="p-3 text-center">
            <div className="text-xs text-ink/60 mb-1">Branch</div>
            <div className="text-xs font-medium text-ink">{staff.branch || "N/A"}</div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <Section title="Contact Information">
          <InfoRow label="Email" value={staff.email} icon={Mail} />
          <InfoRow label="Phone" value={staff.phone || "Not set"} icon={Phone} />
        </Section>

        {/* POSITION */}
        <Section title="Position">
          <InfoRow label="Role" value={staff.role === "ADMIN" ? "Admin" : "Staff"} icon={Briefcase} />
          <InfoRow label="Branch" value={staff.branch || "—"} icon={MapPin} />
        </Section>

        {/* JOIN DATE */}
        <Section title="Employment">
          <InfoRow
            label="Join Date"
            value={staff.joinDate ? new Date(staff.joinDate).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "—"}
            icon={Calendar}
          />
          {staff.joinDate && (
            <div className="text-xs text-ink/60">
              {Math.floor(
                (new Date().getTime() - new Date(staff.joinDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days employed
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

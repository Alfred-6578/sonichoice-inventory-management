'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Syne } from 'next/font/google'
import { DEPARTMENTS, ROLES } from '@/data/staffData'
import { StaffMember } from '@/types/staff'

interface StaffFormPanelProps {
  isOpen: boolean
  onClose: () => void
  initialData?: StaffMember | null
  onSubmit?: (formData: Partial<StaffMember>) => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

const colorOptions = [
  '#2563eb',
  '#7c3aed',
  '#dc2626',
  '#059669',
  '#0891b2',
  '#4f46e5',
  '#d97706',
  '#ca8a04',
  '#16a34a',
  '#ea580c'
]

const branches = ['Lagos HQ', 'Abuja Branch', 'Port Harcourt Branch', 'Kano Branch', 'Ibadan Branch']

export default function StaffFormPanel({
  isOpen,
  onClose,
  initialData,
  onSubmit
}: StaffFormPanelProps) {
  const [formData, setFormData] = useState<Partial<StaffMember>>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      status: 'active',
      onlineStatus: false,
      joinDate: new Date().toISOString().split('T')[0],
      av: '',
      color: '#2563eb',
      branch: ''
    }
  )

  const handleInputChange = (key: keyof StaffMember, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const generateAvatarInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleNameChange = (value: string) => {
    const av = generateAvatarInitials(value)
    handleInputChange('name', value)
    handleInputChange('av', av)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      alert('Please fill in all required fields')
      return
    }
    onSubmit?.(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 sm:w-[460px] w-full bg-surface-raised border-l border-border flex flex-col z-60 shadow-lg">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-ink-subtle uppercase tracking-wider mb-1">
            {initialData ? 'Edit' : 'Add'} Staff
          </div>
          <div className={`text-xl font-bold text-ink ${syne.className}`}>
            {initialData ? 'Edit Staff Member' : 'Add New Staff'}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-surface transition flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Personal Info */}
        <div className="bg-surface/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-ink mb-3">Personal Information</h3>
          <div className="space-y-3">
            <Input
              id="name"
              label="Full Name *"
              value={formData.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Chidinma Eze"
              required
            />

            <Input
              id="email"
              label="Email *"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@company.ng"
              required
            />

            <Input
              id="phone"
              label="Phone Number *"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+234 xxx xxx xxxx"
              required
            />
          </div>
        </div>

        {/* Position Info */}
        <div className="bg-surface/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-ink mb-3">Position</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Role *</label>
              <select
                value={formData.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Department *</label>
              <select
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Branch</label>
              <select
                value={formData.branch || ''}
                onChange={(e) => handleInputChange('branch', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status & Dates */}
        <div className="bg-surface/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-ink mb-3">Status</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Input
              id="joinDate"
              label="Join Date"
              type="date"
              value={formData.joinDate || ''}
              onChange={(e) => handleInputChange('joinDate', e.target.value)}
            />
          </div>
        </div>

        {/* Avatar Color */}
        <div className="bg-surface/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-ink mb-3">Avatar Color</h3>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleInputChange('color', color)}
                className={`w-8 h-8 rounded-lg border-2 ${
                  formData.color === color ? 'border-ink' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </form>

      {/* FOOTER */}
      <div className="border-t border-border p-5 flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={()=> handleSubmit} className="flex-1">
          {initialData ? 'Update' : 'Add'} Staff
        </Button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Syne } from 'next/font/google'
import { createBranch } from '@/lib/branches'

interface BranchFormData {
  name: string
  city: string
  state: string
  address: string
  phone: string
  email: string
  manager: string
  managerAv: string
  managerColor: string
  maxHolding: number
  color: string
  isHead: boolean
}

interface BranchFormPanelProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (formData: any) => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

const colorOptions = [
  '#2563eb', '#d97706', '#059669', '#0891b2', '#4f46e5', '#7c3aed',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a'
]

const managerColorOptions = [
  '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#4f46e5'
]

export default function BranchFormPanel({ isOpen, onClose, onSubmit }: BranchFormPanelProps) {
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    city: '',
    state: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    managerAv: '',
    managerColor: '#2563eb',
    maxHolding: 10,
    color: '#2563eb',
    isHead: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.city || !formData.state) {
      setError('Name, address, city, and state are required.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await createBranch({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        email: formData.email,
        country: "Nigeria",
      })
      setSuccess(`"${result.name}" has been added successfully!`)
      setFormData({
        name: '', city: '', state: '', address: '', phone: '', email: '',
        manager: '', managerAv: '', managerColor: '#2563eb', maxHolding: 10,
        color: '#2563eb', isHead: false,
      })
      onSubmit?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BranchFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Auto-generate manager avatar from name
  const handleManagerNameChange = (name: string) => {
    const av = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    setFormData(prev => ({ ...prev, manager: name, managerAv: av }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 sm:w-100 w-full bg-surface-raised border-l border-border flex flex-col z-60 shadow-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-ink-subtle uppercase tracking-wider mb-1">
            Branches
          </div>
          <div className={`text-xl font-bold text-ink ${syne.className}`}>
            Add New Branch
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-subtle hover:bg-surface transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {success && (
          <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          id="branch-name"
          label="Branch Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter branch name"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="city"
            label="City"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            required
          />

          <Input
            id="state"
            label="State"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="State"
            required
          />
        </div>

        <Input
          id="address"
          label="Address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Full address"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="phone"
            label="Phone (optional)"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+234 xxx xxx xxxx"
          />

          <Input
            id="email"
            label="Email (optional)"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="branch@sonichoice.ng"
          />
        </div>

        {/* Manager Section */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-ink mb-3">Branch Manager</h3>

          <Input
            id="manager-name"
            label="Manager Name"
            value={formData.manager}
            onChange={(e) => handleManagerNameChange(e.target.value)}
            placeholder="Full name"
            required
          />

          
        </div>

        {/* Branch Settings */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-ink mb-3">Branch Settings</h3>

          <div className="space-y-3">
           

            <div className="flex items-center gap-2">
              <input
                id="is-head-office"
                type="checkbox"
                checked={formData.isHead}
                onChange={(e) => handleInputChange('isHead', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="is-head-office" className="text-sm text-ink">
                This is a head office
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding...' : 'Add Branch'}
          </Button>
        </div>
      </form>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Syne } from 'next/font/google'

interface MerchantFormData {
  name: string
  contact: string
  phone: string
  email: string
  color: string
}

interface MerchantFormPanelProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (formData: MerchantFormData) => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

const colorOptions = [
  '#2563eb', '#d97706', '#059669', '#0891b2', '#4f46e5', '#7c3aed',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a'
]

export default function MerchantFormPanel({ isOpen, onClose, onSubmit }: MerchantFormPanelProps) {
  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    contact: '',
    phone: '',
    email: '',
    color: '#2563eb'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const handleInputChange = (field: keyof MerchantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 sm:w-100 w-full bg-surface-raised border-l border-border flex flex-col z-60 shadow-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-ink-subtle uppercase tracking-wider mb-1">
            Merchants
          </div>
          <div className={`text-xl font-bold text-ink ${syne.className}`}>
            Add New Merchant
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
        <Input
          id="merchant-name"
          label="Merchant Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter merchant name"
          required
        />

        <Input
          id="primary-contact"
          label="Primary Contact"
          value={formData.contact}
          onChange={(e) => handleInputChange('contact', e.target.value)}
          placeholder="Contact person name"
          required
        />

        <Input
          id="phone-number"
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+234 xxx xxx xxxx"
          required
        />

        <Input
          id="email-address"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="contact@merchant.com"
          required
        />

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Brand Color</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleInputChange('color', color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  formData.color === color ? 'border-ink' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button type="submit" className="w-full">
            Add Merchant
          </Button>
        </div>
      </form>
    </div>
  )
}
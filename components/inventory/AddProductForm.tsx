'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Input from '@/components/ui/Input'
import { DM_Mono, Syne } from 'next/font/google'

interface StockEntry {
  branch: string
  quantity: number
  lowAlert: number
}

interface AddProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (formData: any) => void
}

const merchants = [
  'TechVault NG',
  'FashionHub',
  'Adunola Stores',
  'PharmaPlus',
  'HomeStyle Co.',
  'GrainMart',
]

const categories = [
  'Electronics',
  'Fashion',
  'Food & Grocery',
  'Home & Living',
  'Pharmaceuticals',
]

const units = ['pcs', 'kg', 'litres', 'cartons', 'boxes', 'pairs']

const branches = [
  'Lagos Head Office',
  'Abuja Branch',
  'Port Harcourt Branch',
  'Kano Branch',
  'Ibadan Branch',
]

const syne = Syne({
    variable: "--font-syne",
})

const dm_mono = DM_Mono({
    variable:"--font-dm_mono",
    subsets:["latin"],
    weight: ["300","400","500"]
})

export default function AddProductForm({ isOpen, onClose, onSubmit }: AddProductFormProps) {
  const [merchant, setMerchant] = useState('')
  const [productName, setProductName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [description, setDescription] = useState('')
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
    { branch: 'Lagos Head Office', quantity: 0, lowAlert: 10 },
    { branch: 'Abuja Branch', quantity: 0, lowAlert: 10 },
  ])
  const [dateReceived, setDateReceived] = useState('')
  const [storageNotes, setStorageNotes] = useState('')

  const handleAddBranch = () => {
    const availableBranches = branches.filter(
      b => !stockEntries.some(e => e.branch === b)
    )
    if (availableBranches.length > 0) {
      setStockEntries([
        ...stockEntries,
        { branch: availableBranches[0], quantity: 0, lowAlert: 10 },
      ])
    }
  }

  const handleBranchChange = (index: number, newBranch: string) => {
    const updated = [...stockEntries]
    updated[index].branch = newBranch
    setStockEntries(updated)
  }

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...stockEntries]
    updated[index].quantity = qty
    setStockEntries(updated)
  }

  const handleLowAlertChange = (index: number, alert: number) => {
    const updated = [...stockEntries]
    updated[index].lowAlert = alert
    setStockEntries(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      merchant,
      productName,
      sku,
      category,
      unit,
      description,
      stockEntries,
      dateReceived,
      storageNotes,
    }
    onSubmit?.(formData)
  }

  if (!isOpen) return null

  return (
    <>
    
      {/* Form Panel */}
      <div className="fixed right-0 top-0 bottom-0 sm:w-100 w-full max-w-full bg-white border-l border-gray-200 flex flex-col z-60 transform translate-x-0 transition-transform duration-300 shadow-lg">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-3 flex-shrink-0">
          <div>
            <div className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider mb-0.75">
              Inventory
            </div>
            <div className={`font-display text-xl font-bold text-gray-900 letter-spacing-tighter ${syne.className}`}>
              Add product entry
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-gray-400 flex-shrink-0 transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5">
          {/* Info Box */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-2.5 mb-5 text-xs text-gray-500 leading-relaxed">
            Each product entry is unique to one merchant. If multiple merchants store the same product
            type, add separate entries for each.
          </div>

          {/* Merchant */}
          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Merchant
            </label>
            <select
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
            >
              <option value="">- Select merchant -</option>
              {merchants.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name & SKU */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
                SKU / Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. IPH-15P-256"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
              >
                <option value="">- Select -</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Stock by Branch Section */}
          <div className="relative my-1.5 py-1.5">
            <div className="absolute inset-0 left-0 right-0 h-px bg-gray-200" style={{ top: '50%' }} />
            <div className="relative inline-block bg-white px-2.5 text-xs font-mono text-gray-400 text-transform-uppercase letter-spacing-wider">
              Stock by branch
            </div>
          </div>

          {/* Stock Entries Header */}
          <div className="grid grid-cols-[1fr_80px_60px] gap-2 mb-1.5">
            <span className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider">
              Branch
            </span>
            <span className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider">
              Quantity
            </span>
            <span className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider">
              Low alert
            </span>
          </div>

          {/* Stock Entry Rows */}
          {stockEntries.map((entry, index) => (
            <div key={index} className="grid grid-cols-[1fr_80px_60px] gap-2 mb-2">
              <select
                value={entry.branch}
                onChange={(e) => handleBranchChange(index, e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={entry.quantity}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                placeholder="0"
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
              />
              <input
                type="number"
                min="0"
                value={entry.lowAlert}
                onChange={(e) => handleLowAlertChange(index, parseInt(e.target.value) || 0)}
                placeholder="10"
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
              />
            </div>
          ))}

          {/* Add Branch Button */}
          {stockEntries.length < branches.length && (
            <button
              type="button"
              onClick={handleAddBranch}
              className="font-mono text-xs text-amber-600 bg-none border-none cursor-pointer text-decoration-underline px-0 py-0 mt-2 hover:text-amber-700 transition-colors"
            >
              + Add another branch
            </button>
          )}

          {/* Pricing Section */}
          <div className="relative py-4">
            <div className="absolute inset-0 left-0 right-0 h-px bg-gray-200" style={{ top: '50%' }} />
            <div className="relative inline-block bg-white px-2.5 text-xs font-mono text-gray-400 text-transform-uppercase letter-spacing-wider">
              Pricing
            </div>
          </div>

          {/* Unit Cost & Date */}
          <div className="grid grid-cols-1 gap-3 mb-4">
           
            <div>
              <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
                Date Received
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
              />
            </div>
          </div>

          {/* Storage Notes */}
          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Storage Notes (optional)
            </label>
            <textarea
              value={storageNotes}
              onChange={(e) => setStorageNotes(e.target.value)}
              placeholder="e.g. Keep refrigerated, Fragile..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-200 flex gap-2.5 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4.5 py-2.75 rounded-lg bg-transparent text-gray-500 font-display text-sm font-semibold border border-gray-200 cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4.5 py-2.75 rounded-lg bg-gray-900 text-white font-display text-sm font-bold border-none cursor-pointer transition-all hover:bg-gray-800"
          >
            Add Product
          </button>
        </div>
      </div>
    </>
  )
}

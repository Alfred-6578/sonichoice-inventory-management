'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Syne } from 'next/font/google'
import { createProduct } from '@/lib/products'
import { getMerchants, ApiMerchant } from '@/lib/merchants'
import { getBranches, ApiBranch } from '@/lib/branches'

interface BranchStock {
  branchId: string
  quantity: number
  lowStockAlert: number
}

interface AddProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (formData: any) => void
}

const syne = Syne({
  variable: "--font-syne",
})

export default function AddProductForm({ isOpen, onClose, onSubmit }: AddProductFormProps) {
  const [productName, setProductName] = useState('')
  const [merchantId, setMerchantId] = useState('')
  const [description, setDescription] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [dateReceived, setDateReceived] = useState('')
  const [branchEntries, setBranchEntries] = useState<BranchStock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [merchants, setMerchants] = useState<ApiMerchant[]>([])
  const [branches, setBranches] = useState<ApiBranch[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true)
      Promise.all([
        merchants.length === 0 ? getMerchants().then(res => res.data || []) : Promise.resolve(merchants),
        branches.length === 0 ? getBranches() : Promise.resolve(branches),
      ])
        .then(([m, b]) => {
          setMerchants(m)
          setBranches(b)
          // Initialize with first branch if no entries yet
          if (branchEntries.length === 0 && b.length > 0) {
            setBranchEntries([{ branchId: b[0].id, quantity: 0, lowStockAlert: 10 }])
          }
        })
        .catch((err) => console.error('Failed to load data:', err))
        .finally(() => setLoadingData(false))
    }
  }, [isOpen])

  const resetForm = () => {
    setProductName('')
    setMerchantId('')
    setDescription('')
    setAdditionalInfo('')
    setDateReceived('')
    setBranchEntries(branches.length > 0 ? [{ branchId: branches[0].id, quantity: 0, lowStockAlert: 10 }] : [])
    setError('')
    setSuccess('')
  }

  const handleAddBranch = () => {
    const usedIds = branchEntries.map((e) => e.branchId)
    const available = branches.find((b) => !usedIds.includes(b.id))
    if (available) {
      setBranchEntries([...branchEntries, { branchId: available.id, quantity: 0, lowStockAlert: 10 }])
    }
  }

  const handleRemoveBranch = (index: number) => {
    setBranchEntries(branchEntries.filter((_, i) => i !== index))
  }

  const handleBranchChange = (index: number, field: keyof BranchStock, value: string | number) => {
    const updated = [...branchEntries]
    updated[index] = { ...updated[index], [field]: value }
    setBranchEntries(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productName || !merchantId) {
      setError('Product name and merchant are required.')
      return
    }

    // Filter out branches with 0 quantity
    const validBranches = branchEntries.filter((b) => b.quantity > 0)
    if (validBranches.length === 0) {
      setError('At least one branch must have a quantity greater than 0.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await createProduct({
        name: productName,
        merchantId,
        description: description || undefined,
        dateReceived: dateReceived ? new Date(dateReceived).toISOString() : undefined,
        additionalInfo: additionalInfo || undefined,
        branches: validBranches,
      })

      setSuccess(`"${productName}" has been added successfully!`)
      resetForm()
      onSubmit?.(result)
    } catch (err) {
      console.error('Failed to create product:', err)
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  const usedBranchIds = branchEntries.map((e) => e.branchId)
  const canAddMore = branches.some((b) => !usedBranchIds.includes(b.id))

  return (
    <>
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
            onClick={handleClose}
            className="w-7 h-7 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-gray-400 flex-shrink-0 transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5">
          {/* Info Box */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-2.5 mb-5 text-xs text-gray-500 leading-relaxed">
            Each product entry is unique to one merchant. Set the quantity for each branch where this product will be stored.
          </div>

          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Merchant */}
          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Merchant
            </label>
            <select
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
            >
              <option value="">
                {loadingData ? 'Loading...' : '— Select merchant —'}
              </option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. iPhone 15 Pro Max"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 256GB Space White"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
            />
          </div>

          {/* Date Received */}
          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Date Received (optional)
            </label>
            <input
              type="date"
              value={dateReceived}
              onChange={(e) => setDateReceived(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
            />
          </div>

          {/* Stock by Branch Section */}
          <div className="relative my-4">
            <div className="absolute inset-0 left-0 right-0 h-px bg-gray-200" style={{ top: '50%' }} />
            <div className="relative inline-block bg-white px-2.5 text-xs font-mono text-gray-400 text-transform-uppercase letter-spacing-wider">
              Stock by branch
            </div>
          </div>

          {/* Branch Headers */}
          <div className="grid grid-cols-[1fr_70px_70px_28px] gap-2 mb-1.5">
            <span className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider">
              Branch
            </span>
            <span className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider">
              Qty
            </span>
            <span className="font-mono text-xs text-gray-400 text-transform-uppercase letter-spacing-wider">
              Low alert
            </span>
            <span />
          </div>

          {/* Branch Rows */}
          {branchEntries.map((entry, index) => (
            <div key={index} className="grid grid-cols-[1fr_70px_70px_28px] gap-2 mb-2">
              <select
                value={entry.branchId}
                onChange={(e) => handleBranchChange(index, 'branchId', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} disabled={usedBranchIds.includes(b.id) && b.id !== entry.branchId}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={entry.quantity}
                onChange={(e) => handleBranchChange(index, 'quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="px-2 py-2 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
              />
              <input
                type="number"
                min="0"
                value={entry.lowStockAlert}
                onChange={(e) => handleBranchChange(index, 'lowStockAlert', parseInt(e.target.value) || 0)}
                placeholder="10"
                className="px-2 py-2 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400"
              />
              {branchEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBranch(index)}
                  className="w-7 h-7 mt-0.5 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Add Branch Button */}
          {canAddMore && (
            <button
              type="button"
              onClick={handleAddBranch}
              className="font-mono text-xs text-amber-600 bg-none border-none cursor-pointer px-0 py-0 mt-1 mb-4 hover:text-amber-700 transition-colors underline"
            >
              + Add another branch
            </button>
          )}

          {/* Additional Info */}
          <div className="relative my-4">
            <div className="absolute inset-0 left-0 right-0 h-px bg-gray-200" style={{ top: '50%' }} />
            <div className="relative inline-block bg-white px-2.5 text-xs font-mono text-gray-400 text-transform-uppercase letter-spacing-wider">
              Additional
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-mono text-xs text-gray-500 text-transform-uppercase letter-spacing-wider mb-1.5">
              Additional Info (optional)
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Fragile items, handle with care..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-sans text-sm text-gray-900 outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 placeholder-gray-400 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-200 flex gap-2.5 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4.5 py-2.75 rounded-lg bg-transparent text-gray-500 font-display text-sm font-semibold border border-gray-200 cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-4.5 py-2.75 rounded-lg text-white font-display text-sm font-bold border-none cursor-pointer transition-all ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </div>
    </>
  )
}

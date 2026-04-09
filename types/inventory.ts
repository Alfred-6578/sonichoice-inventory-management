export type BranchStock = {
  [key: string]: number | undefined
}

export type Merchant = {
  name: string
  av: string
  color: string
  contact: string
  phone: string
  email: string
}

export type HistoryEntry = {
  type: string
  label: string
  branch: string
  date: string
}

export type InventoryItem = {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  merchant: Merchant
  stock: BranchStock
  totalQty: number
  lowAlert: number
  dateIn: string
  updatedAt: string
  notes: string
  history: HistoryEntry[]
}
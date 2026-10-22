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

// One branch's stock for a product, keeping the ids the API gave us so edits
// never have to match a branch by name (names are not unique).
export type StockRow = {
  branchId: string
  branchName: string
  quantity: number
  lowStockAlert: number
}

export type InventoryItem = {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  merchant: Merchant
  stock: BranchStock
  stockRows: StockRow[]
  totalQty: number
  lowAlert: number
  dateIn: string
  updatedAt: string
  notes: string
  history: HistoryEntry[]
}
export interface MerchantProfile {
  id: string
  name: string
  av: string
  color: string
  contact: string
  phone: string
  email: string
  status: "active" | "inactive" | "suspended"
  joinDate: string
  totalProducts: number
  totalStock: number
  pendingOrders: number
  averageRating: number
}

export type MerchantFilters = {
  search: string
  status: "all" | "active" | "inactive" | "suspended"
  category: string
}
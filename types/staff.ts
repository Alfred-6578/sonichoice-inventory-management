export interface StaffMember {
  id: string
  name: string
  av: string // avatar initials
  color: string // hex color for avatar
  role: string // e.g., "Operations Manager", "Driver", "Dispatcher"
  department: string // e.g., "Operations", "Logistics", "Admin"
  email: string
  phone: string
  status: "active" | "inactive" | "suspended"
  onlineStatus?: boolean
  joinDate: string // format: "2024-01-15"
  salary?: number // annual salary (optional)
  branch?: string // branch assignment (optional)
}

export type StaffFilters = {
  search: string
  status: "all" | "active" | "inactive" | "suspended"
  department: string
  role: string
}

export interface StaffDetailPanelProps {
  staff: StaffMember | null
  onClose: () => void
  onEdit?: () => void
  onDelete?: (id: string) => void
  onSuspend?: (id: string, newStatus: "active" | "suspended") => void
}

export interface StaffFormPanelProps {
  isOpen: boolean
  onClose: () => void
  initialData?: StaffMember | null
  onSubmit?: (formData: Partial<StaffMember>) => void
}
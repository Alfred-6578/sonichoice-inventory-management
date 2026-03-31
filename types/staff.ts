export interface StaffMember {
  id: string
  name: string
  av: string
  color: string
  role: string
  email: string
  phone: string
  status: "active" | "inactive" | "suspended"
  branchId?: string
  branch?: string
  joinDate: string
}

export type StaffFilters = {
  search: string
  role: string
  branch: string
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

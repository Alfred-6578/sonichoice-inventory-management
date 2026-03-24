import { StaffMember } from '@/types/staff'

export const STAFF: StaffMember[] = [
  {
    id: 'STF-001',
    name: 'Chidinma Eze',
    av: 'CE',
    color: '#2563eb',
    role: 'Operations Manager',
    department: 'Operations',
    email: 'chidinma@company.ng',
    phone: '0803-123-4567',
    status: 'active',
    onlineStatus: true,
    joinDate: '2024-01-15',
    branch: 'Lagos HQ'
  },
  {
    id: 'STF-002',
    name: 'Tunde Bakare',
    av: 'TB',
    color: '#7c3aed',
    role: 'Driver',
    department: 'Logistics',
    email: 'tunde@company.ng',
    phone: '0805-234-5678',
    status: 'active',
    onlineStatus: true,
    joinDate: '2024-02-10',
    branch: 'Abuja Branch'
  },
  {
    id: 'STF-003',
    name: 'Adeyemi Sola',
    av: 'AS',
    color: '#dc2626',
    role: 'Dispatcher',
    department: 'Operations',
    email: 'adeyemi@company.ng',
    phone: '0807-345-6789',
    status: 'active',
    onlineStatus: false,
    joinDate: '2024-03-05',
    branch: 'Port Harcourt Branch'
  },
  {
    id: 'STF-004',
    name: 'Ngozi Eze',
    av: 'NE',
    color: '#059669',
    role: 'HR Manager',
    department: 'Human Resources',
    email: 'ngozi@company.ng',
    phone: '0809-456-7890',
    status: 'active',
    onlineStatus: true,
    joinDate: '2023-11-20',
    branch: 'Lagos HQ'
  },
  {
    id: 'STF-005',
    name: 'Emeka Nwosu',
    av: 'EN',
    color: '#0891b2',
    role: 'Driver',
    department: 'Logistics',
    email: 'emeka@company.ng',
    phone: '0808-567-8901',
    status: 'suspended',
    onlineStatus: false,
    joinDate: '2024-01-30',
    branch: 'Kano Branch'
  },
  {
    id: 'STF-006',
    name: 'Funke Adeola',
    av: 'FA',
    color: '#4f46e5',
    role: 'Delivery Officer',
    department: 'Operations',
    email: 'funke@company.ng',
    phone: '0810-678-9012',
    status: 'active',
    onlineStatus: true,
    joinDate: '2024-02-28',
    branch: 'Lagos HQ'
  },
  {
    id: 'STF-007',
    name: 'Bola Adeyemi',
    av: 'BA',
    color: '#d97706',
    role: 'Finance Officer',
    department: 'Finance',
    email: 'bola@company.ng',
    phone: '0811-789-0123',
    status: 'active',
    onlineStatus: false,
    joinDate: '2023-12-15',
    branch: 'Lagos HQ'
  },
  {
    id: 'STF-008',
    name: 'Aisha Bello',
    av: 'AB',
    color: '#ca8a04',
    role: 'Receptionist',
    department: 'Admin',
    email: 'aisha@company.ng',
    phone: '0812-890-1234',
    status: 'inactive',
    onlineStatus: false,
    joinDate: '2024-03-10',
    branch: 'Ibadan Branch'
  }
]

export const DEPARTMENTS = [
  'Operations',
  'Logistics',
  'Human Resources',
  'Finance',
  'Admin'
]

export const ROLES = [
  'Operations Manager',
  'Driver',
  'Dispatcher',
  'HR Manager',
  'Delivery Officer',
  'Finance Officer',
  'Receptionist',
  'Warehouse Manager',
  'Field Officer'
]
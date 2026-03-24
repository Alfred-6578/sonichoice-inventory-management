'use client'

import { useState, useMemo } from 'react'
import StaffTable from '@/components/staff/StaffTable'
import StaffDetailPanel from '@/components/staff/StaffDetailPanel'
import StaffFormPanel from '@/components/staff/StaffFormPanel'
import PageHeader from '@/components/ui/PageHeader'
import FilterBar from '@/components/ui/FilterBar'
import Overlay from '@/components/ui/Overlay'
import { STAFF, DEPARTMENTS } from '@/data/staffData'
import { StaffFilters, StaffMember } from '@/types/staff'
import { Plus, Download } from 'lucide-react'

export default function StaffPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    status: 'all',
    department: '',
    role: ''
  })

  const selectedStaff = STAFF.find((s) => s.id === selectedId) || null

  const filteredStaff = useMemo(() => {
    return STAFF.filter((staff) => {
      if (
        filters.search &&
        !staff.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !staff.email.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false
      if (filters.status !== 'all' && staff.status !== filters.status) return false
      if (filters.department && staff.department !== filters.department) return false
      return true
    })
  }, [filters])

  const activeStaff = STAFF.filter((s) => s.status === 'active').length
  const onlineStaff = STAFF.filter((s) => s.onlineStatus).length
  const suspendedStaff = STAFF.filter((s) => s.status === 'suspended').length

  const handleEdit = () => {
    if (selectedStaff) {
      setEditingStaff(selectedStaff)
      setFormOpen(true)
      setSelectedId(null)
    }
  }

  const handleAddStaff = () => {
    setEditingStaff(null)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log('Delete staff:', id)
    // TODO: Implement actual deletion
  }

  const handleSuspend = (id: string, newStatus: 'active' | 'suspended') => {
    console.log('Update status:', id, newStatus)
    // TODO: Implement actual status update
  }

  const handleSubmit = (formData: Partial<StaffMember>) => {
    if (editingStaff) {
      console.log('Update staff:', editingStaff.id, formData)
      // TODO: Implement actual update
    } else {
      console.log('Add new staff:', formData)
      // TODO: Implement actual add
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headerText="Team · 8 members"
        mainText="Staff Management"
        subText={`${activeStaff} active · ${onlineStaff} online · ${suspendedStaff} suspended`}
        button1="Export"
        button2="Add Staff"
        button1Icon={<Download size={16} />}
        button2Icon={<Plus size={16} />}
        onButton2={handleAddStaff}
      />

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        total={filteredStaff.length}
        filterConfigs={[
          {
            label: 'Status',
            key: 'status',
            options: [
              { value: 'all', label: 'All Staff' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'inactive', label: 'Inactive' }
            ]
          },
          {
            label: 'Department',
            key: 'department',
            options: [
              { value: '', label: 'All Departments' },
              ...DEPARTMENTS.map((dept) => ({ value: dept, label: dept }))
            ]
          }
        ]}
      />

      <StaffTable
        staff={filteredStaff}
        onSelect={(staff) => setSelectedId(staff.id)}
        selectedId={selectedId}
      />

      {selectedStaff && (
        <StaffDetailPanel
          staff={selectedStaff}
          onClose={() => setSelectedId(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSuspend={handleSuspend}
        />
      )}

      <Overlay isOpen={formOpen} onClose={() => setFormOpen(false)} />
      {formOpen && (
        <StaffFormPanel
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          initialData={editingStaff}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
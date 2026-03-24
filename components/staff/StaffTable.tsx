import { StaffMember } from '@/types/staff'
import AvatarName from '@/components/ui/AvatarName'
import StatusBadge from '@/components/ui/StatusBadge'
import { useMemo } from 'react'
import { Table } from '../ui/Table'

interface StaffTableProps {
  staff: StaffMember[]
  onSelect: (member: StaffMember) => void
  selectedId?: string | null
}

export default function StaffTable({ staff, onSelect, selectedId }: StaffTableProps) {
  const getOnlineIcon = (online?: boolean) => {
    if (online === undefined) return null
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          online ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {staff.length > 0 ? (
        <Table>
          <Table.Head>
            <Table.Row className="bg-white sticky top-0">
              <Table.Cell head>Name</Table.Cell>
              <Table.Cell head>Role</Table.Cell>
              <Table.Cell head>Department</Table.Cell>
              <Table.Cell head>Status</Table.Cell>
              <Table.Cell head>Phone</Table.Cell>
              <Table.Cell head>Joined</Table.Cell>
            </Table.Row>
          </Table.Head>

          <Table.Body data={staff} onRowClick={onSelect}>
            {(member) => (
              <>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <AvatarName
                      color={member.color}
                      initials={member.av}
                      name={member.name}
                    />
                    {getOnlineIcon(member.onlineStatus)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm font-medium">{member.role}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-ink/70">{member.department}</span>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={member.status} />
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm font-mono">{member.phone}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-ink/60">
                    {new Date(member.joinDate).toLocaleDateString('en-NG')}
                  </span>
                </Table.Cell>
              </>
            )}
          </Table.Body>
        </Table>
      ) : (
        <div className="text-center py-12">
          <p className="text-ink/60">No staff members found</p>
        </div>
      )}
    </div>
  )
}
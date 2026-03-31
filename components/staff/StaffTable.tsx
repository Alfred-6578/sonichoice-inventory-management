import { StaffMember } from '@/types/staff'
import { Table } from '../ui/Table'

interface StaffTableProps {
  staff: StaffMember[]
  onSelect: (member: StaffMember) => void
  selectedId?: string | null
}

export default function StaffTable({ staff, onSelect, selectedId }: StaffTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      {staff.length > 0 ? (
        <Table>
          <Table.Head>
            <Table.Row className="bg-white sticky top-0">
              <Table.Cell head>Name</Table.Cell>
              <Table.Cell head>Email</Table.Cell>
              <Table.Cell head>Role</Table.Cell>
              <Table.Cell head>Branch</Table.Cell>
              <Table.Cell head>Joined</Table.Cell>
            </Table.Row>
          </Table.Head>

          <Table.Body data={staff} onRowClick={onSelect}>
            {(member) => (
              <>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.av}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{member.name}</div>
                      {member.phone && (
                        <div className="text-[10px] text-ink-subtle font-mono">{member.phone}</div>
                      )}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-ink-muted font-mono">{member.email}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    member.role === "ADMIN"
                      ? "bg-amber/10 text-amber-700 border border-amber/30"
                      : "bg-surface border border-border text-ink-muted"
                  }`}>
                    {member.role === "ADMIN" ? "Admin" : "Staff"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-ink/70">{member.branch || "—"}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-ink/60 font-mono">
                    {member.joinDate
                      ? new Date(member.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : "—"}
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

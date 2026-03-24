import { StaffMember } from '@/types/staff'
import { X, Phone, Mail, Briefcase, MapPin, Calendar, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Syne } from 'next/font/google'
import { RiTeamLine } from 'react-icons/ri'

interface StaffDetailPanelProps {
  staff: StaffMember | null
  onClose: () => void
  onEdit?: () => void
  onDelete?: (id: string) => void
  onSuspend?: (id: string, newStatus: 'active' | 'suspended') => void
}

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin']
})

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="border-b border-border last:border-b-0">
      <h3 className="text-sm font-semibold text-ink px-4 py-3 bg-surface">{title}</h3>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string | React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

function InfoRow({ label, value, icon: Icon }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-ink/60 flex-shrink-0 mt-1" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink/60 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm text-ink font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function StaffDetailPanel({
  staff,
  onClose,
  onEdit,
  onDelete,
  onSuspend
}: StaffDetailPanelProps) {
  if (!staff) return null

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${staff.name}?`)) {
      onDelete?.(staff.id)
      onClose()
    }
  }

  const handleSuspend = () => {
    const newStatus = staff.status === 'suspended' ? 'active' : 'suspended'
    onSuspend?.(staff.id, newStatus)
  }

  return (
    <div className="sm:w-[420px] w-full bg-surface-raised border-l border-border flex flex-col fixed top-0 z-50 right-0 h-screen">
      {/* HEADER */}
      <div className="px-4 py-4 border-b border-border flex items-start justify-between gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-ink-subtle uppercase tracking-wider mb-1">Staff Member</div>
          <div className={`text-lg font-bold text-ink ${syne.className}`}>{staff.name}</div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:bg-surface transition flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        {/* METRICS */}
        <div className="grid grid-cols-2 border-b border-border bg-surface/50">
          <div className="p-3 border-r border-border text-center">
            <div className="text-xs text-ink/60 mb-1">Status</div>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-m ${
                staff.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : staff.status === 'suspended'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {staff.status === 'active' && '●'} {staff.status}
            </div>
          </div>
          {/* <div className="p-3 border-r border-border text-center">
            <div className="text-xs text-ink/60 mb-1">Online</div>
            <div className="flex items-center justify-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  staff.onlineStatus ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-xs font-m">{staff.onlineStatus ? 'Online' : 'Offline'}</span>
            </div>
          </div> */}
          <div className="p-3 text-center">
            <div className="text-xs text-ink/60 mb-1">Branch</div>
            <div className="text-xs font-m text-ink">{staff.branch || 'N/A'}</div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <Section title="Contact Information" >

        
          <InfoRow label="Email" value={staff.email} icon={Mail} />
          <InfoRow label="Phone" value={staff.phone} icon={Phone} />
        </Section>

        {/* ROLE & DEPARTMENT */}
        <Section title="Position">

          <InfoRow label="Role" value={staff.role} icon={Briefcase} />
          <InfoRow label="Department" value={staff.department} icon={RiTeamLine}/>
          
        </Section>

        {/* JOIN DATE */}
        <Section title="Employment">
          <InfoRow
            label="Join Date"
            value={new Date(staff.joinDate).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            icon={Calendar}
          />
          <div className="text-xs text-ink/60">
            {Math.floor(
              (new Date().getTime() - new Date(staff.joinDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{' '}
            days employed
          </div>
        </Section>

        {/* STATUS NOTE */}
        {staff.status === 'suspended' && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Account Suspended</p>
              <p className="text-xs text-amber-800 mt-1">This account is temporarily unavailable</p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER - ACTIONS */}
      <div className="border-t border-border p-4 flex flex-col gap-2 gap-y-3">
        <Button onClick={onEdit} className="w-full" size='sm'>
          Edit Staff Member
        </Button>
        <Button
          onClick={handleSuspend}
          variant={staff.status === 'suspended' ? 'primary' : 'outline'}
          className="w-full"
          size='sm'
        >
          {staff.status === 'suspended' ? 'Activate' : 'Suspend'}
        </Button>
        <Button onClick={handleDelete} variant="danger" className="w-full" size='sm'>
          Remove
        </Button>
      </div>
    </div>
  )
}
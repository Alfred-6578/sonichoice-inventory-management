'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser } from '@/lib/auth'
import { getUsers, ApiUser } from '@/lib/users'
import { getBranches } from '@/lib/branches'
import StaffTable from '@/components/staff/StaffTable'
import StaffDetailPanel from '@/components/staff/StaffDetailPanel'
import PageHeader from '@/components/ui/PageHeader'
import FilterBar from '@/components/ui/FilterBar'
import { StaffFilters, StaffMember } from '@/types/staff'
import { Plus } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

function mapApiUser(u: ApiUser): StaffMember {
  const initials = (u.name || "??")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return {
    id: u.id,
    name: u.name,
    av: initials,
    color: "#374151",
    role: u.role || "USER",
    email: u.email,
    phone: u.phone || "",
    status: "active",
    branchId: u.branchId || "",
    branch: u.branch?.name || "",
    joinDate: u.createdAt
      ? new Date(u.createdAt).toISOString().split("T")[0]
      : "",
  }
}

export default function StaffPage() {
  const router = useRouter()

  // Block non-admin users
  useEffect(() => {
    const user = getStoredUser()
    const role = (user?.role || "").toUpperCase()
    if (role !== "ADMIN") {
      router.replace("/dashboard")
    }
  }, [router])

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [allBranches, setAllBranches] = useState<{ id: string; name: string }[]>([])
  const allBranchesRef = useRef(allBranches)
  allBranchesRef.current = allBranches

  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    role: '',
    branch: '',
  })

  const debouncedSearch = useDebounce(filters.search)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const branchId = allBranchesRef.current.find(b => b.name === filters.branch)?.id

      const res = await getUsers({
        page,
        search: debouncedSearch || undefined,
        role: filters.role || undefined,
        branchId: branchId || undefined,
      })
      setStaff((res.data || []).map(mapApiUser))

      if (res.meta) {
        setTotalCount(res.meta.total)
        setTotalPages(res.meta.lastPage)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters.role, filters.branch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Fetch branches for filter dropdown
  useEffect(() => {
    getBranches().then(branches => {
      setAllBranches(branches.map(b => ({ id: b.id, name: b.name })))
    }).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headerText={`Team · ${totalCount} members`}
        mainText="Staff Management"
        subText={`${staff.length} shown · Page ${page} of ${totalPages}`}
        loading={loading}
        button2="Register User"
        button2Icon={<Plus size={16} />}
        onButton2={() => router.push('/register')}
      />

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        total={staff.length}
        onChange={(f) => {
          if ((f as StaffFilters).role !== filters.role) setPage(1)
          if ((f as StaffFilters).branch !== filters.branch) setPage(1)
          setFilters(f as StaffFilters)
        }}
        filterConfigs={[
          {
            label: 'Role',
            key: 'role',
            options: [
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'Staff' },
            ],
          },
          {
            label: 'Branch',
            key: 'branch',
            options: allBranches.map(b => ({ value: b.name, label: b.name })),
          },
        ]}
        resetKeys={["search", "role", "branch"]}
        disabled={loading}
      />

      {loading ? (
        <StaffTableSkeleton />
      ) : (
        <StaffTable
          staff={staff}
          onSelect={(member) => setSelectedStaff(member)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {selectedStaff && (
        <StaffDetailPanel
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onUpdated={() => {
            setSelectedStaff(null)
            fetchUsers()
          }}
        />
      )}
    </div>
  )
}

function StaffTableSkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-200">
            {["Name", "Email", "Role", "Branch", "Joined"].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-gray-400 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-3 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-5 w-14 bg-gray-100 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
              <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

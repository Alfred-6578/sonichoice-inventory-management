'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import FilterBar from '@/components/ui/FilterBar'
import { getActivityLogs, getMyActivityLogs, ActivityLogEntry, ActivityLogKeywordCounts } from '@/lib/activityLogs'
import { getStoredUser } from '@/lib/auth'
import { getBranches } from '@/lib/branches'
import { useDebounce } from '@/hooks/useDebounce'
import { Syne } from 'next/font/google'
import { Clock, Package, Box, Layers, Store, MapPin, User, LogIn, LogOut, MoreHorizontal } from 'lucide-react'
import ErrorCard from '@/components/ui/ErrorCard'

const syne = Syne({ variable: '--font-syne', subsets: ['latin'] })

type Scope = 'all' | 'me'

type Filters = {
  search: string
  branch: string
  scope: Scope
}

const KEYWORDS = [
  { key: 'all', label: 'All' },
  { key: 'parcel', label: 'Parcel' },
  { key: 'product', label: 'Product' },
  { key: 'stock', label: 'Stock' },
  { key: 'merchant', label: 'Merchant' },
  { key: 'branch', label: 'Branch' },
  { key: 'user', label: 'User' },
  { key: 'login', label: 'Login' },
  { key: 'logout', label: 'Logout' },
  { key: 'other', label: 'Other' },
] as const

const KEYWORD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  parcel: Package,
  product: Box,
  stock: Layers,
  merchant: Store,
  branch: MapPin,
  user: User,
  login: LogIn,
  logout: LogOut,
  other: MoreHorizontal,
}

const KEYWORD_COLORS: Record<string, string> = {
  parcel: '#f59e0b',
  product: '#2563eb',
  stock: '#0891b2',
  merchant: '#7c3aed',
  branch: '#059669',
  user: '#4f46e5',
  login: '#16a34a',
  logout: '#dc2626',
  other: '#6b7280',
}

function detectKeyword(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('login')) return 'login'
  if (a.includes('logout')) return 'logout'
  if (a.includes('parcel')) return 'parcel'
  if (a.includes('stock')) return 'stock'
  if (a.includes('product')) return 'product'
  if (a.includes('merchant')) return 'merchant'
  if (a.includes('branch')) return 'branch'
  if (a.includes('user')) return 'user'
  return 'other'
}

function timeAgo(iso: string): string {
  const date = new Date(iso)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [counts, setCounts] = useState<ActivityLogKeywordCounts | null>(null)
  const [activeKeyword, setActiveKeyword] = useState<string>('all')
  const [allBranches, setAllBranches] = useState<{ id: string; name: string }[]>([])
  const allBranchesRef = useRef(allBranches)
  allBranchesRef.current = allBranches
  const [isAdmin, setIsAdmin] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    search: '',
    branch: '',
    scope: 'all',
  })

  const debouncedSearch = useDebounce(filters.search, 1500)

  useEffect(() => {
    const user = getStoredUser()
    setIsAdmin((user?.role || '').toUpperCase() === 'ADMIN')
  }, [])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const branchId = allBranchesRef.current.find((b) => b.name === filters.branch)?.id
      const sharedFilters = {
        page,
        search: debouncedSearch || undefined,
        actionKeyword: activeKeyword !== 'all' ? activeKeyword.toUpperCase() : undefined,
      }

      const res = filters.scope === 'me'
        ? await getMyActivityLogs(sharedFilters)
        : await getActivityLogs({ ...sharedFilters, branchId: branchId || undefined })

      setLogs(res.data || [])
      if (res.meta) {
        setTotalCount(res.meta.total)
        setTotalPages(res.meta.lastPage)
      }
      if (res.keywordCounts) setCounts(res.keywordCounts)
    } catch (err) {
      console.error('Failed to fetch activity logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load activity logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeKeyword, filters.branch, filters.scope])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Fetch branches for filter dropdown
  useEffect(() => {
    getBranches()
      .then((branches) => setAllBranches(branches.map((b) => ({ id: b.id, name: b.name }))))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headerText={`${totalCount} log${totalCount !== 1 ? 's' : ''}`}
        mainText="Activity Logs"
        subText={`Page ${page} of ${totalPages}`}
        loading={loading}
      />

      {/* Scope toggle */}
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilters((f) => ({ ...f, scope: 'all' }))
              setPage(1)
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
              filters.scope === 'all'
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink-muted border-border hover:bg-surface'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => {
              setFilters((f) => ({ ...f, scope: 'me' }))
              setPage(1)
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
              filters.scope === 'me'
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink-muted border-border hover:bg-surface'
            }`}
          >
            My Activity
          </button>
        </div>
      )}

      {/* Keyword pills */}
      <div className="flex flex-wrap gap-2">
        {KEYWORDS.map((kw) => {
          const count = counts?.[kw.key as keyof ActivityLogKeywordCounts] ?? 0
          const Icon = KEYWORD_ICONS[kw.key]
          const isActive = activeKeyword === kw.key
          return (
            <button
              key={kw.key}
              onClick={() => {
                setActiveKeyword(kw.key)
                setPage(1)
              }}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition ${
                isActive
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink-muted border-border hover:bg-surface'
              } ${loading ? 'opacity-60' : ''}`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span className="font-medium">{kw.label}</span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-white/70' : 'text-ink-subtle'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        total={logs.length}
        onChange={(f) => {
          if ((f as Filters).branch !== filters.branch) setPage(1)
          setFilters((prev) => ({ ...prev, ...(f as Filters) }))
        }}
        filterConfigs={
          filters.scope === 'all' && isAdmin
            ? [
                {
                  label: 'Branch',
                  key: 'branch',
                  options: allBranches.map((b) => ({ value: b.name, label: b.name })),
                },
              ]
            : []
        }
        resetKeys={['search', 'branch']}
        disabled={loading}
      />

      {/* Logs list */}
      {loading ? (
        <ActivityLogsSkeleton />
      ) : error ? (
        <ErrorCard message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <div className="text-center py-14 bg-white border border-border rounded-xl">
          <div className="w-11 h-11 mx-auto mb-3 rounded-lg bg-surface border border-border flex items-center justify-center">
            <Clock className="w-5 h-5 text-ink-subtle" />
          </div>
          <div className="text-ink font-medium">No activity logs found</div>
          <div className="text-ink-subtle text-sm">Try adjusting your filters</div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {logs.map((log, i) => {
            const keyword = detectKeyword(log.action)
            const Icon = KEYWORD_ICONS[keyword] || MoreHorizontal
            const color = KEYWORD_COLORS[keyword] || '#6b7280'
            return (
              <div
                key={log.id || i}
                className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-none hover:bg-surface/50 transition"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm text-ink leading-snug ${syne.className}`}>
                    {log.action}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-subtle mt-0.5">
                    {log.userName && (
                      <span className="font-medium">{log.userName}</span>
                    )}
                    {log.userEmail && (
                      <span className="font-mono">{log.userEmail}</span>
                    )}
                    {log.branchName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {log.branchName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-ink-subtle shrink-0 mt-1">
                  {timeAgo(log.createdAt)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-ink-subtle text-ink-subtle rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function ActivityLogsSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-none">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/5 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-2/5 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

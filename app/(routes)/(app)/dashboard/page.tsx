'use client'
import ActivityList from '@/components/dashboard/ActivityList';
import BranchList from '@/components/dashboard/BranchList';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import ParcelSection from '@/components/dashboard/ParcelSection';
import PageHeader from '@/components/ui/PageHeader'
import QuickStats from '@/components/ui/QuickStatsContainer';
import { MetricItem } from '@/types/metricsTypes';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getDashboard, DashboardData } from '@/lib/dashboard'
import { getActivityLogs, ActivityLogEntry } from '@/lib/activityLogs'

const Dashboard = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DashboardData | null>(null)
    const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])

    const fetchDashboard = useCallback(async () => {
        setLoading(true)
        try {
            const [d, activity] = await Promise.all([
                getDashboard(),
                getActivityLogs({ page: 1 }).catch(() => null),
            ])
            setData(d)
            if (activity) setActivityLogs(activity.data || [])
        } catch (err) {
            console.error("Failed to fetch dashboard:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboard()
    }, [fetchDashboard])

    // Get user name and branchId from localStorage
    const [userName, setUserName] = useState("")
    const [userBranchId, setUserBranchId] = useState("")
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user")
            if (raw) {
                const user = JSON.parse(raw)
                setUserName(user.name?.split(" ")[0] || "")
                setUserBranchId(user.branchId || "")
            }
        } catch {}
    }, [])

    const now = new Date()
    const hour = now.getHours()
    const greeting =
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
        "Good evening"

    const day = now.toLocaleDateString(undefined, { weekday: "long" })

    const stats = data?.parcelStats
    const overview = data?.overview

    // Build metrics from API data
    const metricsData: MetricItem[] = stats ? [
        {
            label: "In Transit",
            value: stats.inTransit,
            sub: "across branches",
            tone: "amber",
            delta: {
                type: stats.monthlyGrowth > 0 ? "positive" : stats.monthlyGrowth < 0 ? "negative" : "neutral",
                value: stats.monthlyGrowth !== 0 ? `${stats.monthlyGrowth > 0 ? "+" : ""}${stats.monthlyGrowth}% this month` : "—",
            },
        },
        {
            label: "Received",
            value: stats.received,
            sub: "this month",
            tone: "green",
            delta: {
                type: stats.thisMonth >= stats.lastMonth ? "positive" : "negative",
                value: stats.lastMonth > 0
                    ? `${stats.thisMonth >= stats.lastMonth ? "↑" : "↓"} ${Math.abs(Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100))}%`
                    : "—",
            },
        },
        {
            label: "Pending",
            value: stats.pending,
            sub: "awaiting dispatch",
            tone: "neutral",
            delta: { type: "neutral", value: `${stats.total} total` },
        },
    ] : []

    // Quick stats from overview
    const quickStatsData = overview ? [
        {
            value: stats?.thisMonth || 0,
            label: "Parcels this month",
            tone: "amber" as const,
            icon: (
                <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09C6.04 10.33 6 10.66 6 11v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81C7.85 19.79 9.78 21 12 21s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z" />
            ),
        },
        {
            value: overview.activeMerchants,
            label: "Active merchants",
            tone: "green" as const,
            icon: (
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            ),
        },
        {
            value: overview.totalBranches,
            label: "Active branches",
            tone: "neutral" as const,
            icon: (
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            ),
        },
    ] : []

    // Map branchHoldings to BranchList format
    const branchesForList = (data?.branchHoldings || []).map((b) => ({
        id: b.id,
        name: b.name,
        location: `${b.city}, ${b.state}`,
        parcels: b.totalStock,
    }))

    // Determine user's branch — use branchId from JWT, fallback to first branch for admins
    const currentBranchId = userBranchId
        || data?.branchHoldings?.[0]?.id
        || ""

    // Map recentParcels to ParcelSection format
    const recentParcels = (data?.recentParcels || []).map((p) => {
        const merchant = p.merchants?.[0] || p.merchant
        const merchantName = merchant?.name || "Unknown"
        const statusMap: Record<string, string> = {
            PENDING: "pending",
            IN_TRANSIT: "transit",
            RECEIVED: "received",
            CANCELLED: "cancelled",
            RETURNED: "returned",
        }
        const fromId = p.fromBranchId || p.fromBranch?.id || ""
        const toId = p.toBranchId || p.toBranch?.id || ""
        // Incoming = parcel is coming TO this branch, Outgoing = parcel is going FROM this branch
        const direction: "incoming" | "outgoing" | "other" =
            toId === currentBranchId ? "incoming"
            : fromId === currentBranchId ? "outgoing"
            : "other"

        return {
            id: p.trackingNumber || p.id.slice(0, 8),
            apiId: p.id,
            client: {
                name: merchantName,
                location: p.fromBranch?.name || "",
                avatarColor: merchant?.color || "#374151",
            },
            merchants: (p.merchants || (p.merchant ? [p.merchant] : [])).map((m) => ({
                name: m.name,
                initials: m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
                color: m.color || "#374151",
            })),
            location: direction === "incoming" ? (p.fromBranch?.name || "") : (p.toBranch?.name || ""),
            size: (p.size || "Medium") as "Small" | "Medium" | "Large" | "XL",
            status: (statusMap[p.status] || "pending") as "transit" | "received" | "pending" | "cancelled" | "returned",
            _direction: direction,
        }
    })

    // Split by branch-based direction
    const parcelSectionData = {
        incoming: recentParcels.filter(p => p._direction === "incoming"),
        outgoing: recentParcels.filter(p => p._direction === "outgoing" ),
    }

    const handleParcelClick = (parcel: { apiId?: string }) => {
        if (parcel.apiId) {
            router.push(`/parcels?parcelId=${parcel.apiId}`)
        }
    }

    // Map activity logs to ActivityList format
    const detectActivityType = (action: string): "transit" | "received" | "new" | "movement" => {
        const a = action.toLowerCase()
        if (a.includes("transit") || a.includes("dispatch")) return "transit"
        if (a.includes("received") || a.includes("delivered")) return "received"
        if (a.includes("move") || a.includes("transfer")) return "movement"
        return "new"
    }
    const timeAgo = (iso: string): string => {
        const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
        if (seconds < 60) return `${seconds}s`
        const m = Math.floor(seconds / 60)
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h}h`
        const d = Math.floor(h / 24)
        return `${d}d`
    }
    const activityData = activityLogs.slice(0, 5).map((log, i) => ({
        id: log.id || String(i),
        type: detectActivityType(log.action),
        title: log.action,
        meta: [log.userName, log.branchName].filter(Boolean).join(" · "),
        time: timeAgo(log.createdAt),
    }))

    return (
        <div className='flex flex-col gap-6'>
            <PageHeader
                headerText={`${day}`}
                subText={`${stats?.inTransit || 0} in transit · ${stats?.pending || 0} pending`}
                loading={loading}
                mainText={`${greeting}${userName ? `, ${userName}` : ""}`}
                button1='My Profile'
                button2='Log Parcel'
                button1Icon={<svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#6b7280]"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"></path></svg>}
                button2Icon={<Plus/>}
                onButton1={() => router.push('/profile')}
                onButton2={() => router.push('/parcels')}
            />

            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    <MetricsGrid data={metricsData} />

                    <QuickStats data={quickStatsData} />

                    {/* Top Merchants */}
                    {data?.topMerchants && data.topMerchants.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wide">
                                        Top Merchants
                                    </span>
                                    <span className="text-[10px] px-2 py-[2px] rounded bg-[#f4f5f7] border border-[#e4e7ec] text-[#6b7280]">
                                        {data.topMerchants.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.push('/merchants')}
                                    className="text-sm text-[#6b7280] flex items-center gap-1 hover:text-[#111827] transition"
                                >
                                    View all
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
                                {data.topMerchants.map((m) => {
                                    const initials = m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                                    return (
                                        <div
                                            key={m.id}
                                            onClick={() => router.push('/merchants')}
                                            className="flex items-center gap-3 px-4 py-3 border-b border-[#e4e7ec] last:border-none hover:bg-[#f4f5f7] transition cursor-pointer"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                                style={{ backgroundColor: m.color }}
                                            >
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-[#111827] truncate">{m.name}</div>
                                                <div className="text-xs text-[#9ca3af] font-mono">
                                                    {m.totalProducts} products
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-[#111827] leading-none">
                                                    {m.totalParcels}
                                                </div>
                                                <div className="text-[10px] text-[#9ca3af] font-mono">parcels</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {recentParcels.length > 0 && (
                        <ParcelSection data={parcelSectionData} onParcelClick={handleParcelClick} />
                    )}

                    {branchesForList.length > 0 && (
                        <BranchList data={branchesForList} />
                    )}

                    {activityData.length > 0 && (
                        <ActivityList data={activityData} />
                    )}
                </>
            )}
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Metrics skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-[#e4e7ec] rounded-xl p-4">
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-3" />
                        <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-3" />
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Quick stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b md:border-b-0 md:border-r border-[#e4e7ec] last:border-none">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
                        <div>
                            <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mb-1" />
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Branch list skeleton */}
            <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#e4e7ec] last:border-none">
                        <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1">
                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1" />
                            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard

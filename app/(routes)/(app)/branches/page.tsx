'use client'
import BranchGrid from '@/components/branches/BranchGrid';
import DetailPanel from '@/components/branches/DetailPanel';
import SummaryStrip from '@/components/branches/SummaryStrip'
import PageHeader from '@/components/ui/PageHeader'
import BranchFormPanel from '@/components/branches/BranchFormPanel'
import Overlay from '@/components/ui/Overlay'
import { BranchDetails } from '@/types/branch';
import { getBranches, ApiBranch } from '@/lib/branches';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function mapApiBranch(b: ApiBranch): BranchDetails {
  const totalHolding = b.productStocks
    ? b.productStocks.reduce((sum, s) => sum + (s.quantity || 0), 0)
    : 0

  // Map users to staff
  const staff = (b.users || []).map((u) => {
    const initials = (u.name || "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    return {
      name: u.name,
      role: u.role || "Staff",
      av: initials,
      color: "#374151",
      online: false,
    }
  })

  // Map product stocks to parcels-like entries for the card
  const parcels = (b.productStocks || []).slice(0, 5).map((s) => ({
    id: s.product?.trackingId || s.productId.slice(0, 8),
    desc: s.product?.name || "Product",
    client: `${s.quantity} units`,
    status: "pending" as const,
  }))

  // Map product stocks for detail panel
  const products = (b.productStocks || []).map((s) => {
    const merchant = (s.product as any)?.merchant;
    return {
      id: s.productId,
      trackingId: s.product?.trackingId || s.productId.slice(0, 8),
      name: s.product?.name || "Product",
      description: (s.product?.description as string) || "",
      quantity: s.quantity || 0,
      lowStockAlert: s.lowStockAlert || 0,
      merchantName: merchant?.name || "",
      merchantColor: merchant?.color || "#374151",
    };
  })

  return {
    id: b.id,
    name: b.name,
    city: b.city || "",
    state: b.state || "",
    isHead: false,
    address: b.address || "",
    phone: b.phone || "",
    email: b.email || "",
    manager: staff.length > 0 ? staff[0].name : "",
    managerAv: staff.length > 0 ? staff[0].av : "",
    managerColor: "#374151",
    staff,
    holding: totalHolding,
    transit: b.productsInTransit || 0,
    delivered: b.productsDelivered || 0,
    pending: b._count?.parcelsFrom || 0,
    maxHolding: Math.max(totalHolding, 10),
    parcels,
    products,
    color: "#374151",
  }
}

const BranchesPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasAppliedParams = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [branches, setBranches] = useState<BranchDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle branchId query param (from dashboard click)
  useEffect(() => {
    if (hasAppliedParams.current || loading || branches.length === 0) return;
    const branchId = searchParams.get("branchId");
    if (branchId) {
      hasAppliedParams.current = true;
      const match = branches.find(b => b.id === branchId);
      if (match) setSelectedId(match.id);
      router.replace("/branches", { scroll: false });
    }
  }, [loading, branches, searchParams]);

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBranches()
      
      
      setBranches(data.map(mapApiBranch))
    } catch (err) {
      console.error("Failed to fetch branches:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const selectedBranch = branches.find(b => b.id === selectedId) || null;

  const stats = [
    {
      label: "Total Branches",
      value: branches.length,
      sub: "locations in the network",
    },
    {
      label: "Total Holding",
      value: branches.reduce((s, b) => s + b.holding, 0),
      sub: "parcels across all branches",
    },
    {
      label: "In Transit",
      value: branches.reduce((s, b) => s + b.transit, 0),
      sub: "between branches now",
      variant: "amber" as const,
    },
    {
      label: "Received",
      value: branches.reduce((s, b) => s + b.delivered, 0),
      sub: "across all branches",
      variant: "green" as const,
    },
  ];

  return (
    <div className='flex flex-col gap-6'>
        <div className="flex flex-col gap-5">
            <PageHeader
                headerText={`Sonichoice Network · ${branches.length} locations`}
                mainText={'Branches'}
                subText={`${branches.length} branches in the network`}
                loading={loading}
                button2='Add Branch'
                onButton2={() => setFormOpen(true)}
            />
            <SummaryStrip stats={stats}/>

            {loading ? (
              <BranchGridSkeleton />
            ) : (
              <BranchGrid branches={branches} onSelect={setSelectedId} selectedId={selectedId}/>
            )}

            {selectedBranch && (
                <DetailPanel
                    branch={selectedBranch}
                    onClose={() => setSelectedId(null)}
                    onUpdated={() => {
                      setSelectedId(null)
                      fetchBranches()
                    }}
                />
            )}
         </div>
        <Overlay isOpen={formOpen} onClose={() => setFormOpen(false)}/>

         {formOpen && (
             <BranchFormPanel
               isOpen={formOpen}
               onClose={() => setFormOpen(false)}
               onSubmit={() => {
                 setFormOpen(false)
                 fetchBranches()
               }}
             />
        )}
    </div>
  )
}

function BranchGridSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto py-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tny:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-[14px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-raised border border-border rounded-[12px] overflow-hidden">
            <div className="p-[14px_16px] border-b border-border">
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="p-[12px_14px] text-center border-r border-border last:border-r-0">
                  <div className="h-6 w-8 mx-auto bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-2 w-12 mx-auto bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BranchesPageWrapper() {
  return (
    <Suspense>
      <BranchesPage />
    </Suspense>
  )
}

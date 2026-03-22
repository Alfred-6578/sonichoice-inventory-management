'use client'
import BranchGrid from '@/components/branches/BranchGrid';
import DetailPanel from '@/components/branches/DetailPanel';
import SummaryStrip from '@/components/branches/SummaryStrip'
import PageHeader from '@/components/ui/PageHeader'
import { BranchesDetails } from '@/data/branchesData';
import React, { useEffect, useState } from 'react'

const stats = [
    {
      label: "Total Holding",
      value: 18,
      sub: "parcels across all branches",
    },
    {
      label: "In Transit",
      value: 3,
      sub: "between branches now",
      variant: "amber" as const,
    },
    {
      label: "Delivered This Month",
      value: 24,
      sub: "across all branches",
      variant: "green" as const,
    },
    {
      label: "Active Staff",
      value: 12,
      sub: "across all locations",
    },
  ];

const BranchesPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedBranch = BranchesDetails.find(b => b.id === selectedId) || null;

  return (
    <div className='flex flex-col gap-6'>
        <div className="flex flex-col gap-5">
            <PageHeader 
                headerText='Sonichoice Network · 3 locations'
                mainText={'Branches'}
                subText='18 parcels currently moving across the network · 2 branches with low-volume alerts'
            />
            <SummaryStrip stats={stats}/>
            <BranchGrid branches={BranchesDetails}  onSelect={setSelectedId} selectedId={selectedId}/>
            {selectedBranch && (
                <DetailPanel
                    branch={selectedBranch}
                    onClose={() => setSelectedId(null)}
                />
            )}
         </div>
    </div>
  )
}

export default BranchesPage
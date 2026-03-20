'use client'
import ActivityList from '@/components/dashboard/ActivityList';
import BranchList from '@/components/dashboard/BranchList';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import ParcelSection from '@/components/dashboard/ParcelSection';
import PageHeader from '@/components/ui/PageHeader'
import QuickStats, { QuickStatCardProps } from '@/components/ui/QuickStatsContainer';
import { activities } from '@/data/activityData';
import { branches } from '@/data/branchesData';
import { metricsData } from '@/data/MetricsData';
import { parcelData } from '@/data/parcelData';
import { quickStatsData } from '@/data/QuickStatsData';
import { MetricItem } from '@/types/metricsTypes';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation'
import React from 'react'



const Dashboard = () => {
    const router = useRouter()
    const userName = "Emeka"
    const branch = "Enugu"
    const transitCount = 1
    const pendingCount = 1

    const transitText =
        transitCount === 1
        ? "1 parcel in transit"
        : `${transitCount} parcels in transit`;

    const pendingText =
        pendingCount === 1
        ? "1 pending dispatch"
        : `${pendingCount} pending dispatch`;

    const now = new Date();

    // Dynamic greeting (UX fix)
    const hour = now.getHours();
    const greeting =
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
        "Good evening";

    const day = now.toLocaleDateString(undefined, {
        weekday: "long",
    });


  return (
    <div className='flex flex-col gap-6'>
        <PageHeader 
            headerText={`${day} · ${branch} Branch`}
            subText={`${transitText} · ${pendingText}`}
            mainText={`${greeting}, ${userName}`}
            button1='My Brach'
            button2='Log Parcel'
            button1Icon={<svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#6b7280]"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"></path></svg>}
            button2Icon={<Plus/>}
            onButton1 = {()=> console.log('/add-parcel')}
            onButton2 = {()=> console.log('/branch')}
        />
        
        <MetricsGrid 
            data={metricsData}
        />

        <QuickStats 
            data={quickStatsData}
        />

        <ParcelSection 
            data={parcelData}
        />

        <BranchList 
            data={branches}
        />

        <ActivityList 
            data={activities}
        />
    </div>
  )
}

export default Dashboard
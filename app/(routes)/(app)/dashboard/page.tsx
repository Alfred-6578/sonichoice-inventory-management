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
import { useRouter } from 'next/navigation'
import React from 'react'



const Dashboard = () => {
    const router = useRouter()

  return (
    <div className='flex flex-col gap-6'>
        <PageHeader 
            userName='Emeka'
            branch='Enugu'
            transitCount={0}
            pendingCount={0}
            onLogParcel = {()=> router.push('/add-parcel')}
            onOpenBranch = {()=> router.push('/branch')}
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
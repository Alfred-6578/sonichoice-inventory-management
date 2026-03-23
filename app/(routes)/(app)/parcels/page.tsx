'use client'
import DetailPanel from '@/components/parcel/DetailPanel'
import ParcelFormPanel from '@/components/parcel/ParcelFormPanel'
import ParcelTable from '@/components/parcel/ParcelTable'
import FilterBar from '@/components/ui/FilterBar'
import Overlay from '@/components/ui/Overlay'
import PageHeader from '@/components/ui/PageHeader'
import StatusPillsContainer from '@/components/ui/StatusPillsContainer'
import StatusPills from '@/components/ui/StatusPillsContainer'
import { PARCELS } from '@/data/parcelData'
import { Filters, Parcel } from '@/types/parcelTypes'
import { Download, Plus } from 'lucide-react'
import React, { useMemo, useState } from 'react'

const ParcelPage = () => {
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
    branch: "",
    size: "",
  });

  const updateFilters = (updates: Partial<Filters>) => {
    setFilters((prev:any) => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      search: "",
      branch: "",
      size: "",
    });
  };

  // 🔥 THIS IS THE CORE
  const filteredData = useMemo(() => {
    return PARCELS.filter((p) => {
      // 1. STATUS
      if (filters.status !== "all" && p.status !== filters.status) {
        return false;
      }

      // 2. SEARCH (ID, client, recipient, desc)
      const search = filters?.search?.toLowerCase();
      if (
        search &&
        !(
          p.id.toLowerCase().includes(search) ||
          p.client.toLowerCase().includes(search) ||
          p.desc.toLowerCase().includes(search)
        )
      ) {
        return false;
      }

      // 3. BRANCH (match from OR to OR current)
      if (
        filters.branch &&
        ![p.from, p.to, p.current].includes(filters.branch)
      ) {
        return false;
      }

      // 4. SIZE
      if (filters.size && p.size !== filters.size) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // 🔢 counts for pills
  const counts = useMemo(() => {
    return {
      all: PARCELS.length,
      transit: PARCELS.filter((p) => p.status === "transit").length,
      pending: PARCELS.filter((p) => p.status === "pending").length,
      delivered: PARCELS.filter((p) => p.status === "delivered").length,
      cancelled: PARCELS.filter((p) => p.status === "cancelled").length,
    };
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      
        <PageHeader 
            headerText='Enugu Branch · 9 parcels'
            mainText={'Parcels'}
            subText='3 in transit · 4 delivered this month'
            button1="Export"
            button2="Log Parcel"
            button1Icon={<Download/>}
            button2Icon={<Plus/>}
            onButton1={()=> {}}
            onButton2={()=> setOpenForm(true)}
        />

        <div className="">
          <StatusPillsContainer
            counts={counts}
            onChange={(status) => updateFilters({ status })}
            activeStatus={filters.status}
          />

          {/* FILTER BAR */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            total={filteredData.length}
            onChange={(f) => updateFilters(f)}
          />

        </div>


        <ParcelTable 
          data={filteredData} setSelectedParcel={setSelectedParcel} onClearFilters={clearFilters}
        />

        <DetailPanel
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
        />


        <ParcelFormPanel
          isOpen={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={(data) => {
            console.log("NEW PARCEL:", data);
          }}
        />

        <Overlay
          isOpen={openForm}
          onClose={() => setOpenForm(false)}
          zIndex={59}
        />
    </div>
  )
}

export default ParcelPage
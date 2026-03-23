"use client"
import PageHeader from '@/components/ui/PageHeader'
import { Download, Plus } from 'lucide-react'
import React from 'react'

const InventoryPage = () => {
  return (
    <div className=''>
        <PageHeader 
            headerText='Inventory · 5 merchants · 14 product entries'
            mainText={'Inventory'}
            subText='3,847 total units across all branches · 2 products below minimum stock threshold
'
            button1="Export"
            button2="Add Product"
            button1Icon={<Download/>}
            button2Icon={<Plus/>}
            onButton1={()=> {}}
            // onButton2={()=> setOpenForm(true)}
        />
    </div>
  )
}

export default InventoryPage
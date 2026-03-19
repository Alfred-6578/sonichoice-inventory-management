import { DM_Mono } from 'next/font/google'
import React from 'react'

const dm_mono = DM_Mono({
    variable: "--font-dm_mono",
    subsets: ["latin"],
    weight: ["300","400","500"]
})

const Tag = ({label}:{label:string}) => {
  return (
    <div className={`bg-pending-bg py-1 px-2.5 text-xs rounded-lg text-ink-muted/80 w-auto inline ${dm_mono.className}`}>
        {label}
    </div>
  )
}

export default Tag
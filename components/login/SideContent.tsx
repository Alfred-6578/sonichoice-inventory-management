'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import { DM_Mono } from 'next/font/google';
import Image from 'next/image';

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SideContent = () => {
  return (
    <div className='max-lg:hidden w-[48%] bg-ink h-screen flex flex-col justify-center  px-10 xs:px-15'>
        <div className="flex justify-between">
            <h1 className={`${syne.className} text-amber font-extrabold text-2xl uppercase`}>sonichoice</h1>
            <div className={`${dm_mono.className} bg-ink-secondary/50 border border-ink-secondary text-ink-muted text-xs rounded-full flex items-center px-2.5 h-6`}>v.101</div>
        </div>
        <div className="">
            <Image className='min-h-80' src={require('@/assets/images/hand_parcel.png')} alt='parcel image'></Image>
        </div>
        <div className="">
            <h1 className={`${syne.className} font-extrabold text-5xl leading-12`}>
                Every parcel, <br/>
                tracked with <br/>
                <span className={`text-amber`}>precision.</span>
            </h1>
            <p className="text-ink-muted text-lg my-4">
                The operations platform for delivery teams managing parcels across multiple branches.
            </p>
            <div className="flex gap-3 mt-6">
                <span className="bg-amber/50 border border-amber text-amber text-xs rounded-lg items-center px-4 py-1">
                    Enugu HQ
                </span>
                <span className="bg-ink-secondary/50 border border-ink-secondary text-ink-muted text-xs rounded-lg items-center px-4 py-1">
                    Nsukka
                </span>
                <span className="bg-ink-secondary/50 border border-ink-secondary text-ink-muted text-xs rounded-lg items-center px-4 py-1">
                    Ebonyi
                </span>
            </div>
        </div>
    </div>
  )
}

export default SideContent
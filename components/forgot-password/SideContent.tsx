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
    <div className='flex flex-col justify-center max-lg:hidden w-[48%] bg-ink h-screen px-10 xs:px-15'>
        <div className="flex justify-between">
            <h1 className={`${syne.className} text-amber font-extrabold text-2xl uppercase`}>Sonichoice</h1>
            <div className={`${dm_mono.className} bg-ink-secondary/50 border border-ink-secondary text-ink-muted text-xs rounded-full flex items-center px-2.5 h-6`}>v.101</div>
        </div>
        <div className="flex justify-center">
            <Image className='max-h-[38vh] xl:max-h-[42vh]' src={require('@/assets/images/forgot_password_mail.png')} alt='parcel image' loading='eager'></Image>
        </div>
        <div className="">
            <h1 className={`${syne.className} font-extrabold text-[42px] leading-11`}>
                We'll find your <br/>
                <span className={`text-amber`}>route back in.</span>
            </h1>
            <p className="text-ink-muted text-lg my-4">
                Enter your work email and we'll send a reset link straight to your inbox.
            </p>
            <div className="flex flex-col gap-6">
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-sm rounded-lg items-center px-2 py-1`}>
                        01
                    </span>
                    <p className="text-border/80 font-semibold">Enter your registered work email</p>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-sm rounded-lg items-center px-2 py-1`}>
                        02
                    </span>
                    <p className="text-border/80 font-semibold">Check your inbox for a reset link — expires in 15 minutes</p>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber text-sm rounded-lg items-center px-2 py-1`}>
                        03
                    </span>
                    <p className="text-border/80 font-semibold">Set a new password and get back to your branch</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SideContent
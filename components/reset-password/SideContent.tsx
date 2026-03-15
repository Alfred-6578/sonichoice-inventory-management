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
            <h1 className={`${syne.className} text-amber font-extrabold text-2xl uppercase`}>Sonichoice</h1>
            <div className={`${dm_mono.className} bg-ink-secondary/50 border border-ink-secondary text-ink-muted text-xs rounded-full flex items-center px-2.5 h-6`}>v.101</div>
        </div>
        <div className="flex justify-center">
            <Image className='max-h-[38vh] xl:max-h-[42vh]' src={require('@/assets/images/forgot_password_mail.png')} alt='parcel image'></Image>
        </div>
        <div className="">
            <h1 className={`${syne.className} font-extrabold text-5xl leading-12`}>
                Almost there — <br/>
                set your
                <span className={`text-amber`}> new password.</span>
            </h1>
            <p className="text-ink-muted text-lg my-4">
               Choose something strong. You won't need to change it again unless you want to.
            </p>
            <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber rounded-lg items-center px-1 py-1`}>
                        
                    </span>
                    <p className="text-border/70 ">At least <b className="">8 characters</b> long</p>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber rounded-lg items-center px-1 py-1`}>
                        
                    </span>
                    <p className="text-border/70 ">Include a <b className="">number or symbol</b></p>
                </div>
                <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber rounded-lg items-center px-1 py-1`}>
                        
                    </span>
                    <p className="text-border/70 ">Cannot be your <b className="">last password</b></p>
                </div>
                 <div className="flex gap-3 items-center">
                    <span className={`${dm_mono.className} bg-amber/20 border border-amber text-amber rounded-lg items-center px-1 py-1`}>
           
                    </span>
                    <p className="text-border/70 ">Reset link is  <b className="">single-use only</b></p>
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default SideContent
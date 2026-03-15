'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import { DM_Mono } from 'next/font/google';
import {BiSolidLock,  BiSolidShield } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dm_mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});


const ResetPassword = () => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  return (
    <div className='flex flex-col justify-center h-full w-full border-t-5 border-t-amber relative px-6 tny:px-10 sm:px-18'>
        <span className="bg-amber absolute top-0 rounded-b-lg px-4 py-2 text-ink font-semibold uppercase text-sm">
            Password Reset · sonichoice
        </span>
        <div className="py-20">
            <h1 className={`${syne.className} text-3xl font-bold text-ink mb-1`}>Set a new password</h1>
            <p className="text-ink-muted text-lg mb-10">Pick something secure. This replaces your current password immediately.</p>

            <form action="" className="">
                <div className="mt-6 mb-2">
                    <label className={`${dm_mono.className} text-ink-muted/80 uppercase`} htmlFor="new_password">New Password</label>
                    <div className="relative rounded-lg ">
                        <BiSolidLock className='absolute mx-3 top-[35%] text-xl text-ink-muted/80'/>
                        <input 
                            className="w-full rounded-lg px-4 pl-10 text-ink-muted bg-white border border-border py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent placeholder:text-ink-muted/70" 
                            type={showPassword ? "text":"password"}  
                            id="new_password" 
                            placeholder="Min. 8 characters"
                        />
                        {
                            showPassword ?
                            <FaEyeSlash onClick={()=>setShowPassword(false)} className='absolute mx-3 top-[35%] right-0 text-xl text-ink-muted/80'/>
                            :
                            <FaEye onClick={()=>setShowPassword(true)} className='absolute mx-3 top-[35%] right-0 text-xl text-ink-muted/80'/>
                        }
                    </div>
                </div>
                 <div className="mt-6 mb-2">
                    <label className={`${dm_mono.className} text-ink-muted/80 uppercase`} htmlFor="new_password">Confirm Password</label>
                    <div className="relative rounded-lg ">
                        <BiSolidLock className='absolute mx-3 top-[35%] text-xl text-ink-muted/80'/>
                        <input 
                            className="w-full rounded-lg px-4 py-3 pl-10 text-ink-muted bg-white border border-border mt-1 focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent placeholder:text-ink-muted/70" 
                            type={showConfirmPassword ? "text":"password"} 
                            id="new_password" 
                            placeholder="Re-enter Password"
                        />
                        {
                            showConfirmPassword ?
                                <FaEyeSlash onClick={()=>setShowConfirmPassword(false)} className='absolute mx-3 top-[35%] right-0 text-xl text-ink-muted/80'/>
                                :
                                <FaEye onClick={()=>setShowConfirmPassword(true)} className='absolute mx-3 top-[35%] right-0 text-xl text-ink-muted/80'/>
                        }
                    </div>
                </div>
                
                <button className={`${syne.className} flex justify-center items-center gap-4 bg-ink hover:bg-ink/90 cursor-pointer w-full mt-10 rounded-lg py-3.5 font-bold text-[22px]`}>
                    Reset Password
                    <BiSolidShield />
                </button>
                
            </form>
       
            <div className="mt-10 flex items-center gap-2">
                <div className="bg-ink-muted/20 h-[1px] w-[49%]"></div>     
                <p className="text-ink-muted/70 text-lg">or</p>
                <div className="bg-ink-muted/20 h-[1px] w-[49%]"></div>     
            </div>

            <div className="text-center mt-7 flex justify-center">
                <Link  href={'/login'}className="text-ink-muted/80 flex items-center gap-3">
                    <BsArrowLeft />
                    <p className=" text-ink-muted"> Back to <b className="font-bold">Sign in</b></p>
                </Link>
            </div>

            
        </div>


    </div>
  )
}

export default ResetPassword
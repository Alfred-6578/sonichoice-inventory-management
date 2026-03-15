'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import {BiSolidLock,  BiSolidShield } from "react-icons/bi";
import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';
import Input from '../ui/Input';
import Button from '../ui/Button';


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const ResetPassword = () => {
    const [newPassword, setNewPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")

  return (
    <div className='flex flex-col justify-center h-full w-full border-t-5 border-t-amber relative px-6 tny:px-10 sm:px-18'>
        <span className="bg-amber absolute top-0 rounded-b-lg px-4 py-2 text-ink font-semibold uppercase text-sm">
            Password Reset · sonichoice
        </span>
        <div className="py-20">
            <h1 className={`${syne.className} text-3xl font-bold text-ink mb-1`}>Set a new password</h1>
            <p className="text-ink-muted text-s mb-10 mt-2">Pick something secure. This replaces your current password immediately.</p>

            <form action="" className="">
                <div className="mt-6 mb-2">
                    <Input
                        label="New Password"
                        id="new_password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        Icon={BiSolidLock}
                    />
                </div>
                 <div className="mt-6 mb-2">
                    <Input
                        label="Confirm Password"
                        id="confirm_password"
                        type="password"
                        placeholder="Re-enter Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        Icon={BiSolidLock}
                    />
                </div>

                <Button
                    onClick={() => {}}
                    variant="primary"
                    fullWidth
                    className="mt-10 py-3.5 text-[22px]"
                    rightIcon={BiSolidShield}
                >
                    Reset Password
                </Button>
            </form>

            <div className="mt-10 flex items-center gap-2">
                <div className="bg-ink-muted/20 h-[1px] w-[49%]"></div>
                <p className="text-ink-muted/70 text-lg">or</p>
                <div className="bg-ink-muted/20 h-[1px] w-[49%]"></div>
            </div>

            <div className="text-center mt-7 flex justify-center">
                <Link  href={'/login'} className="text-ink-muted/80 flex items-center gap-3">
                    <BsArrowLeft />
                    <p className=" text-ink-muted"> Back to <b className="font-bold">Sign in</b></p>
                </Link>
            </div>

        </div>

    </div>
  )
}

export default ResetPassword
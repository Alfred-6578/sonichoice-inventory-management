'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import { BiSolidEnvelope } from "react-icons/bi";
import { BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';
import { IoSend } from 'react-icons/io5';
import Input from '../ui/Input';
import Button from '../ui/Button';


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const ForgotPassword = () => {
  const [email, setEmail] = React.useState("")

  return (
     <div className='flex flex-col justify-center h-screen w-full border-t-5 border-t-amber relative px-6 tny:px-10 sm:px-18'>
        <span className="bg-amber absolute top-0 rounded-b-lg px-4 py-2 text-ink font-semibold uppercase text-sm">
            Password Recovery · sonichoice
        </span>
        <div className="py-20">
            <h1 className={`${syne.className} text-3xl font-bold text-ink mb-1 mt-2`}>Forgot your password?</h1>
            <p className="text-ink-muted mb-10 text-s mt-2">
                No problem. Enter your <b className="font-bold">registered work email</b> and we'll send you a secure link to reset it.
            </p>

            <form action="" className="">
                <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="you@sonichoice.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    Icon={BiSolidEnvelope}
                />
                <p className="pt-3 text-ink-muted/80 text-sm">
                    Use the email address your admin registered for your account.
                </p>

                <Button
                    onClick={() => {}}
                    variant="primary"
                    fullWidth
                    className="mt-10 py-3.5 text-[22px]"
                    rightIcon={IoSend}
                >
                    Send Reset Link
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

export default ForgotPassword
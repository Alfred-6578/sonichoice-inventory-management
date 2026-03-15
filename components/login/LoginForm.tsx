'use client'
import React from 'react'
import { Syne } from 'next/font/google'
import {BiSolidLock, BiSolidEnvelope } from "react-icons/bi";
import { BsArrowRight } from 'react-icons/bs';
import Link from 'next/link';
import Input from '../ui/Input';
import Button from '../ui/Button';


const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const LoginForm = () => {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")

  return (
    <div className='flex flex-col justify-center h-full w-full border-t-5 border-t-amber relative px-6 tny:px-10 sm:px-18'>
        <span className="bg-amber absolute top-0 rounded-b-lg px-4 py-2 text-ink font-semibold uppercase text-sm">
            Secure Access · sonichoice
        </span>
        <div className="py-20">
            <h1 className={`${syne.className} text-3xl font-bold text-ink mb-1 mt-2`}>Welcome back!</h1>
            <p className="text-ink-muted mb-10 text-s">Please enter your credentials to access your account.</p>

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

                <div className="mt-6 mb-2">
                    <Input
                        label="Password"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        Icon={BiSolidLock}
                    />
                </div>

                <Link className='text-amber font-bold' href={'/forgot-password'}>Forgot Password?</Link>
                <Button
                    onClick={() => {}}
                    variant="primary"
                    fullWidth
                    className="mt-10 py-3.5 text-[22px]"
                    rightIcon={BsArrowRight}
                >
                    Sign In
                </Button>
            </form>

            <div className="mt-10 flex items-center gap-2">
                <div className="bg-ink-muted/20 h-[1px] w-[49%]"></div>
                <p className="text-ink-muted/70 text-lg">or</p>
                <div className="bg-ink-muted/20 h-[1px] w-[49%]"></div>
            </div>

            <div className="text-center mt-7">
                <p className="text-ink-muted/80">
                    No account yet?  
                    <Link href={'/'} className="font-bold text-ink-muted"> Request access from your admin</Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default LoginForm
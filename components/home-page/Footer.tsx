import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className='mt-22 w-screen flex max-md:flex-col max-md:gap-4 justify-between items-center bg-ink/80 px-6 tny:px-8 md:px-12 lg:px-18 xl:px-22 py-8 border-t border-border/30'>
        <div className="flex  items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-bold text-black">
                S
                </div>
                <span className="font-bold text-lg tracking-wide text-white">
                SONICHOICE
                </span>
            </div>
        <div className="text-ink-muted">© {new Date().getFullYear()} SwiftLog. All rights reserved.</div>
        <div className="flex gap-4 text-ink-muted">
            <Link href={'#'} className="">Privacy</Link>
            <Link href={'#'} className="">Terms</Link>
            <Link href={'/login'} className="">Sign in</Link>
        </div>
    </footer>
  )
}

export default Footer
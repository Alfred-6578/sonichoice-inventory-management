import React from 'react'
import Link from "next/link";

const Navbar = () => {
 
  return (
    <nav className="w-full fixed flex items-center justify-between px-6 tny:px-8 md:px-12 lg:px-18 xl:px-27 py-6 bg-ink/70 backdrop-blur-sm z-50">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-bold text-black">
          S
        </div>
         <span className="font-bold text-lg tracking-wide text-white">
          SONICHOICE
        </span>
      </div>
       

      {/* Links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
        <a href="#features" className="hover:text-ink-secondary transition">
          Features
        </a>
        <a href="#how" className="hover:text-ink-secondary transition">
          How it works
        </a>
        <a href="#stats" className="hover:text-ink-secondary transition">
          Why sonichoice
        </a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">

        <Link
          href="/login"
          className="flex items-center gap-2 font-semibold bg-amber text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
        >
          Get started
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 
            5.59L12 20l8-8z"/>
          </svg>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar

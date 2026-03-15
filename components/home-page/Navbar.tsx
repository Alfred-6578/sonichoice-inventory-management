import React from 'react'
import Link from "next/link";

const Navbar = () => {
 
  return (
    <nav className="w-full fixed flex items-center justify-between px-6 py-4 bg-ink">

      {/* Logo */}
      <div className="flex items-center gap-2">

        <span className="font-semibold text-lg tracking-wide text-white">
          SONICHOICE
        </span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
        <a href="#features" className="hover:text-ink transition">
          Features
        </a>
        <a href="#how" className="hover:text-ink transition">
          How it works
        </a>
        <a href="#stats" className="hover:text-ink transition">
          Why SwiftLog
        </a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm text-ink-muted hover:text-ink transition"
        >
          Sign in
        </Link>

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

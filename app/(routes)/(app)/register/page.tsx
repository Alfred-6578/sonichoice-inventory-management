'use client'

import React, { useEffect, useState } from 'react'
import { Syne } from 'next/font/google'
import { BiSolidEnvelope, BiSolidLock, BiSolidPhone, BiSolidUser } from 'react-icons/bi'
import { BsArrowRight, BsArrowLeft } from 'react-icons/bs'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { registerUser } from '@/lib/auth'
import { getBranches } from '@/lib/branches'

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
})

const RegisterPage = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [branchId, setBranchId] = useState("")
  const [role, setRole] = useState<"USER" | "ADMIN">("USER")
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getBranches().then((data) => {
      setBranches(data.map(b => ({ id: b.id, name: b.name })))
    }).catch(() => {})
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword || !branchId) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await registerUser({ email, password, name, ...(phone ? { phone } : {}), branchId, role })
      setSuccess(true)
      setName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setConfirmPassword("")
      setBranchId("")
      setRole("USER")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xl mx-auto w-full">
        <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#e4e7ec] px-6 py-5">
            <h1 className={`${syne.className} text-2xl font-bold text-[#111827]`}>Register New User</h1>
            <p className="text-sm text-[#9ca3af] mt-1">Create a new staff account for the system.</p>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {success ? (
              <div className="space-y-5">
                <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  User registered successfully.
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSuccess(false)}
                  >
                    Register Another
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm">
                      <BsArrowLeft className="text-sm" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  id="name"
                  type="text"
                  placeholder="e.g. Emeka Okafor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  Icon={BiSolidUser}
                />

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="user@sonichoice.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  Icon={BiSolidEnvelope}
                />

                {/* <Input
                  label="Phone Number (optional)"
                  id="phone"
                  type="tel"
                  placeholder="+234 xxx xxx xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  Icon={BiSolidPhone}
                /> */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#9ca3af] uppercase tracking-wide mb-1.5">Branch</label>
                    <Select
                      id="branch"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      options={branches.map(b => ({ value: b.id, label: b.name }))}
                      placeholder="— Select branch —"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9ca3af] uppercase tracking-wide mb-1.5">Role</label>
                    <Select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                      options={[
                        { value: "USER", label: "Staff" },
                        { value: "ADMIN", label: "Admin" },
                      ]}
                      placeholder="— Select role —"
                    />
                  </div>
                </div>

                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  Icon={BiSolidLock}
                />

                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  Icon={BiSolidLock}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                  className="mt-2 py-3 text-lg"
                  rightIcon={BsArrowRight}
                >
                  {loading ? "Registering..." : "Register User"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

'use client'

import { useEffect, useState } from 'react'
import { Syne } from 'next/font/google'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getStoredUser } from '@/lib/auth'
import { api } from '@/lib/api'
import { RiLockPasswordFill } from 'react-icons/ri'

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
})

type UserData = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  branchId: string
  branch?: { id: string; name: string; city?: string; state?: string }
  createdAt: string
  updatedAt: string
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserData | null>(null)

  // Password update
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updating, setUpdating] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    const stored = getStoredUser()
    if (stored) setUser(stored)
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    setPwSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill in all fields.")
      return
    }

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.")
      return
    }

    if (currentPassword === newPassword) {
      setPwError("New password must be different from current password.")
      return
    }

    setUpdating(true)
    try {
      await api("/auth/password-update", {
        method: "POST",
        body: { currentPassword, newPassword },
      })
      setPwSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setUpdating(false)
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "??"

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        headerText="Account"
        mainText="My Profile"
        subText={user?.branch?.name || "Loading..."}
      />

      {user ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Details Card */}
          <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e4e7ec]">
              <span className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wide">
                Account Details
              </span>
            </div>

            <div className="p-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#111827] text-[#f59e0b] flex items-center justify-center rounded-xl text-lg font-bold">
                  {initials}
                </div>
                <div>
                  <div className={`${syne.className} text-xl font-bold text-[#111827]`}>
                    {user.name}
                  </div>
                  <div className="text-sm text-[#9ca3af] capitalize">
                    {user.role?.toLowerCase() || "Staff"}
                  </div>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-4">
                <InfoRow label="Email" value={user.email} mono />
                <InfoRow label="Phone" value={user.phone || "Not set"} mono />
                <InfoRow label="Branch" value={user?.branch?.name || "—"} />
                <InfoRow label="Role" value={user.role?.toLowerCase() || "staff"} capitalize />
                <InfoRow label="Member since" value={joinDate} />
              </div>
            </div>
          </div>

          {/* Password Update Card */}
          <div className="bg-white border border-[#e4e7ec] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e4e7ec]">
              <span className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wide">
                Update Password
              </span>
            </div>

            <div className="p-5">
              {pwSuccess && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  Password updated successfully.
                </div>
              )}

              {pwError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {pwError}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <Input
                  label="Current Password"
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPwSuccess(false) }}
                  Icon={RiLockPasswordFill}
                  size="sm"
                />

                <Input
                  label="New Password"
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  Icon={RiLockPasswordFill}
                  size="sm"
                />

                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  Icon={RiLockPasswordFill}
                  size="sm"
                />

                <p className="text-[11px] text-[#9ca3af]">
                  Password must be at least 8 characters.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={updating}
                  className="mt-2"
                >
                  {updating ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <ProfileSkeleton />
      )}
    </div>
  )
}

function InfoRow({ label, value, mono, capitalize: cap }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f4f5f7] last:border-none">
      <span className="text-xs text-[#9ca3af] uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-[#111827] ${mono ? "font-mono" : ""} ${cap ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-[#e4e7ec] rounded-xl p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between py-3 border-b border-gray-100">
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#e4e7ec] rounded-xl p-5">
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse mb-3" />
        ))}
      </div>
    </div>
  )
}

export default ProfilePage

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Camera, Loader2, Sparkles, Key, Gift, User, Lock, Mail, Ticket } from "lucide-react"
import useSWR from "swr"
import { formatNumber } from "@/lib/format-utils"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.077.077 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SettingsPage() {
  const { data: user, mutate } = useSWR("/api/auth/me", fetcher)
  const { data: recentActionsData } = useSWR("/api/user/recent-actions", fetcher)
  const searchParams = useSearchParams()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [requestingCode, setRequestingCode] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [unlinkingDiscord, setUnlinkingDiscord] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editUsername, setEditUsername] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [redeemingCode, setRedeemingCode] = useState(false)

  useEffect(() => {
    const discordSuccess = searchParams.get("discord_success")
    const discordError = searchParams.get("discord_error")
    const bonus = searchParams.get("bonus")

    if (discordSuccess === "bonus" && bonus) {
      toast.success(`Thank you for connecting your Discord! You received ¢${bonus} chips as a bonus!`)
      mutate()
      window.history.replaceState({}, "", "/settings")
    } else if (discordSuccess === "linked") {
      toast.success("Thank you for connecting your Discord account!")
      mutate()
      window.history.replaceState({}, "", "/settings")
    } else if (discordSuccess === "linked_no_bonus") {
      toast.success("Discord linked! Join our Discord server to receive bonus chips.")
      mutate()
      window.history.replaceState({}, "", "/settings")
    } else if (discordError) {
      const errorMessages: Record<string, string> = {
        access_denied: "You denied access to your Discord account",
        no_code: "No authorization code received from Discord",
        not_configured: "Discord OAuth is not configured",
        token_exchange_failed: "Failed to authenticate with Discord",
        user_fetch_failed: "Failed to get Discord user info",
        already_linked: "This Discord account is already linked to another user",
        not_logged_in: "You must be logged in to link Discord",
        invalid_session: "Invalid session, please log in again",
        unknown: "An unknown error occurred",
      }
      toast.error(errorMessages[discordError] || "Failed to link Discord account")
      window.history.replaceState({}, "", "/settings")
    }
  }, [searchParams, mutate])

  const handleRequestCode = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }

    setRequestingCode(true)

    try {
      const res = await fetch("/api/auth/password-change/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Verification code sent to your email")
        setCodeSent(true)
      } else {
        toast.error(data.error || "Failed to send verification code")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setRequestingCode(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codeSent) {
      toast.error("Please request a verification code first")
      return
    }

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setUpdatingPassword(true)

    try {
      const res = await fetch("/api/auth/password-change/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setVerificationCode("")
        setCodeSent(false)
      } else {
        toast.error(data.error || "Failed to update password")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    setUploadingPhoto(true)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        const res = await fetch("/api/auth/update-profile-picture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePicture: base64 }),
        })

        if (res.ok) {
          toast.success("Profile picture updated")
          mutate()
        } else {
          toast.error("Failed to update profile picture")
        }
        setUploadingPhoto(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("An error occurred")
      setUploadingPhoto(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editUsername.trim() || !editEmail.trim()) {
      toast.error("Username and email are required")
      return
    }

    setUpdatingProfile(true)

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editUsername, email: editEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Profile updated successfully")
        mutate()
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleDiscordLink = () => {
    window.location.href = "/api/auth/discord"
  }

  const handleDiscordUnlink = async () => {
    setUnlinkingDiscord(true)
    try {
      const res = await fetch("/api/auth/discord/unlink", {
        method: "POST",
      })

      if (res.ok) {
        toast.success("Discord account unlinked successfully")
        mutate()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to unlink Discord account")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setUnlinkingDiscord(false)
    }
  }

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!promoCode.trim()) {
      toast.error("Please enter a promo code")
      return
    }

    setRedeemingCode(true)

    try {
      const res = await fetch("/api/promo-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Promo code redeemed successfully!")
        setPromoCode("")
        mutate()
      } else {
        toast.error(data.error || "Failed to redeem promo code")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setRedeemingCode(false)
    }
  }

  const formatTransaction = (transaction: any) => {
    const amount = transaction.amount
    const isNegative = amount < 0
    const absAmount = Math.abs(amount)

    let description = transaction.note || transaction.transaction_type

    if (transaction.transaction_type === "key_generation" && transaction.note) {
      description = `Generated license key`
    } else if (transaction.transaction_type === "discord_link_bonus") {
      description = "Discord link bonus"
    } else if (transaction.transaction_type === "registration_bonus") {
      description = "Welcome bonus"
    } else if (transaction.transaction_type === "admin_gift") {
      description = "Gift from admin"
    } else if (transaction.transaction_type === "promo_code") {
      description = "Promo code reward"
    }

    return {
      description,
      amount: absAmount,
      isNegative,
      date: new Date(transaction.created_at).toLocaleDateString(),
      time: new Date(transaction.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const getKeyDuration = (key: any) => {
    if (key.is_lifetime) return "Lifetime"
    if (!key.expiry_date) return "Unknown"
    const created = new Date(key.created_at)
    const expiry = new Date(key.expiry_date)
    const days = Math.round((expiry.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} day${days !== 1 ? "s" : ""}`
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (editUsername === "" && user.username) {
    setEditUsername(user.username)
  }
  if (editEmail === "" && user.email) {
    setEditEmail(user.email)
  }

  const isDiscordLinked = !!user.discord_id

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 animate-fade-in">
      {/* Profile header with modern style */}
      <div className="flex items-center gap-4 py-4">
        <div className="relative group">
          <Avatar className="h-20 w-20 ring-2 ring-emerald-500/50 transition-all duration-300 group-hover:ring-emerald-500">
            {user.profile_picture && (
              <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.username} />
            )}
            <AvatarFallback className="bg-emerald-600 text-white text-xl font-semibold">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{user.username}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-2 h-auto p-0 overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-lg rounded-b-none px-4 py-2 text-muted-foreground transition-all duration-200"
          >
            <User className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-lg rounded-b-none px-4 py-2 text-muted-foreground transition-all duration-200"
          >
            <Lock className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger
            value="redeem"
            className="data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-lg rounded-b-none px-4 py-2 text-muted-foreground transition-all duration-200"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Redeem
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-lg rounded-b-none px-4 py-2 text-muted-foreground transition-all duration-200"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Update Profile Card */}
          <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <User className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                Update your profile
              </CardTitle>
              <p className="text-muted-foreground text-sm">Change your username and email address.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <User className="h-3 w-3" />
                    </div>
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-muted/50 border-border/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <Mail className="h-3 w-3" />
                    </div>
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-muted/50 border-border/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-100 border-0 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {updatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Connected accounts */}
          <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <DiscordIcon className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#5865F2]/10 text-[#5865F2]">
                  <DiscordIcon className="h-4 w-4" />
                </div>
                Connected accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/20">
                    <DiscordIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Discord</span>
                    {isDiscordLinked && user.discord_username && (
                      <span className="text-xs text-muted-foreground">{user.discord_username}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isDiscordLinked ? (
                    <>
                      <span className="text-lime-500 text-sm font-medium">Linked</span>
                      <button
                        onClick={handleDiscordUnlink}
                        disabled={unlinkingDiscord}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors disabled:opacity-50"
                      >
                        {unlinkingDiscord ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlink"}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-red-500 text-sm font-medium">Not linked</span>
                      <button
                        onClick={handleDiscordLink}
                        className="text-[#5865F2] hover:text-[#4752C4] text-sm font-medium transition-colors"
                      >
                        Link
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account details */}
          <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <Key className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Key className="h-4 w-4" />
                </div>
                Account details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50">
                <span className="text-muted-foreground">User ID (UID)</span>
                <span className="font-mono text-sm">{user.uid}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all duration-200 hover:bg-emerald-500/20">
                <span className="text-muted-foreground">Current Chips</span>
                <span className="text-emerald-500 font-semibold text-lg">¢{formatNumber(user.balance)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <Lock className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Lock className="h-4 w-4" />
                </div>
                Change Password
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <Lock className="h-3 w-3" />
                    </div>
                    Old Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={codeSent}
                    className="bg-muted/50 border-border/50 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <Key className="h-3 w-3" />
                    </div>
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-muted/50 border-border/50 transition-all duration-200"
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
                </div>

                {codeSent && (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode" className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="p-1 rounded bg-muted">
                        <Mail className="h-3 w-3" />
                      </div>
                      Code
                    </Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code from email"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      required
                      className="bg-muted/50 border-border/50 font-mono text-center text-lg tracking-widest transition-all duration-200"
                    />
                  </div>
                )}

                <div className="flex flex-col items-center gap-3 pt-2">
                  {!codeSent ? (
                    <Button
                      type="button"
                      onClick={handleRequestCode}
                      disabled={requestingCode || !currentPassword}
                      variant="outline"
                      className="bg-white text-black hover:bg-gray-100 border-0 w-full sm:w-auto transition-all duration-300 hover:scale-[1.02]"
                    >
                      {requestingCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        disabled={updatingPassword}
                        variant="outline"
                        className="bg-white text-black hover:bg-gray-100 border-0 w-full sm:w-auto transition-all duration-300 hover:scale-[1.02]"
                      >
                        {updatingPassword ? "Updating..." : "Update Password"}
                      </Button>

                      <button
                        type="button"
                        onClick={handleRequestCode}
                        disabled={requestingCode}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {requestingCode ? "Sending..." : "Resend Code"}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Redeem Codes Tab */}
        <TabsContent value="redeem" className="mt-6">
          <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <Gift className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
              <Ticket className="absolute -bottom-10 -left-10 h-32 w-32 -rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Ticket className="h-4 w-4" />
                </div>
                Redeem Promo Code
              </CardTitle>
              <p className="text-muted-foreground text-sm">Enter a promo code to receive free chips or discounts.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeemCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promoCode" className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <Gift className="h-3 w-3" />
                    </div>
                    Promo Code
                  </Label>
                  <Input
                    id="promoCode"
                    type="text"
                    placeholder="Enter your promo code (e.g., XMAS2025)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="bg-muted/50 border-border/50 font-mono uppercase transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={redeemingCode || !promoCode.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                >
                  {redeemingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Redeem Code
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-2">How it works</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Enter a valid promo code in the field above</li>
                  <li>• Each code can only be redeemed once per account</li>
                  <li>• Chips will be added to your balance instantly</li>
                  <li>• Some codes may have expiration dates or usage limits</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-6 space-y-6">
          <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <Sparkles className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                Recent Actions
              </CardTitle>
              <p className="text-muted-foreground text-sm">Your recent chip transactions and key generations.</p>
            </CardHeader>
            <CardContent>
              {recentActionsData?.transactions?.length > 0 ? (
                <div className="space-y-3">
                  {recentActionsData.transactions.map((transaction: any) => {
                    const formatted = formatTransaction(transaction)
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              formatted.isNegative ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            {transaction.transaction_type === "key_generation" ? (
                              <Sparkles className="w-4 h-4" />
                            ) : transaction.transaction_type === "discord_link_bonus" ? (
                              <DiscordIcon className="w-4 h-4" />
                            ) : transaction.transaction_type === "promo_code" ? (
                              <Gift className="w-4 h-4" />
                            ) : (
                              <Key className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{formatted.description}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatted.date} at {formatted.time}
                            </span>
                          </div>
                        </div>
                        <span className={`font-semibold ${formatted.isNegative ? "text-red-500" : "text-emerald-500"}`}>
                          {formatted.isNegative ? "-" : "+"}¢{formatted.amount}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent actions yet</div>
              )}
            </CardContent>
          </Card>

          {recentActionsData?.recentKeys?.length > 0 && (
            <Card className="border-border/50 bg-card/80 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                <Key className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Key className="h-4 w-4" />
                  </div>
                  Recent Key Generations
                </CardTitle>
                <p className="text-muted-foreground text-sm">License keys you&apos;ve recently generated.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActionsData.recentKeys.map((key: any) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm text-foreground">{key.license_key}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{getKeyDuration(key)} key</span>
                          <span>•</span>
                          <span>
                            {key.max_devices} device{key.max_devices !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Coins, Users, Clock, Copy, Gift, Sparkles, Loader2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function RewardsPage() {
  const { data: user, mutate } = useSWR("/api/auth/me", fetcher)
  const { data: referralData, mutate: mutateReferral } = useSWR("/api/user/referral", fetcher)

  const [referralCode, setReferralCode] = useState("")
  const [submittingReferral, setSubmittingReferral] = useState(false)

  // AFK earning state
  const [afkActive, setAfkActive] = useState(false)
  const [afkTime, setAfkTime] = useState(0)
  const [afkEarned, setAfkEarned] = useState(0)
  const [claimingAfk, setClaimingAfk] = useState(false)
  const afkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // AFK timer logic - earns 1 chip every 2 minutes (120 seconds)
  useEffect(() => {
    if (afkActive) {
      afkIntervalRef.current = setInterval(() => {
        setAfkTime((prev) => {
          const newTime = prev + 1
          // Every 120 seconds = 1 chip
          if (newTime % 120 === 0) {
            setAfkEarned((e) => e + 1)
          }
          return newTime
        })
      }, 1000)
    } else {
      if (afkIntervalRef.current) {
        clearInterval(afkIntervalRef.current)
      }
    }

    return () => {
      if (afkIntervalRef.current) {
        clearInterval(afkIntervalRef.current)
      }
    }
  }, [afkActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode)
      toast.success("Referral code copied!")
    }
  }

  const handleSubmitReferral = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code")
      return
    }

    setSubmittingReferral(true)
    try {
      const res = await fetch("/api/user/referral/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`Referral code applied! You received ¢${data.bonus} chips!`)
        setReferralCode("")
        mutate()
        mutateReferral()
      } else {
        toast.error(data.error || "Failed to apply referral code")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setSubmittingReferral(false)
    }
  }

  const handleClaimAfk = async () => {
    if (afkEarned === 0) {
      toast.error("No chips to claim yet!")
      return
    }

    setClaimingAfk(true)
    try {
      const res = await fetch("/api/user/afk-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: afkEarned }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`Claimed ¢${afkEarned} chips!`)
        setAfkEarned(0)
        setAfkTime(0)
        mutate()
      } else {
        toast.error(data.error || "Failed to claim chips")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setClaimingAfk(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rewards Center</h1>
        <p className="text-sm md:text-base text-muted-foreground">Earn free chips through referrals and AFK rewards</p>
      </div>

      <Tabs defaultValue="afk" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="afk" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            AFK Earnings
          </TabsTrigger>
          <TabsTrigger value="referral" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Referrals
          </TabsTrigger>
        </TabsList>

        {/* AFK Earnings Tab */}
        <TabsContent value="afk">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
              <Clock className="absolute top-4 right-4 h-32 w-32 rotate-12" />
              <Coins className="absolute bottom-4 left-4 h-24 w-24 -rotate-12" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/20 shadow-lg shadow-green-500/10">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>AFK Earnings</CardTitle>
                  <CardDescription>Stay on this page and earn ¢1 chip every 2 minutes!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50">
                <div className="text-6xl font-mono font-bold text-foreground mb-2">{formatTime(afkTime)}</div>
                <p className="text-sm text-muted-foreground">Time spent</p>

                <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <Coins className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">¢{afkEarned}</span>
                  <span className="text-sm text-muted-foreground">earned</span>
                </div>

                <p className="text-xs text-muted-foreground mt-2">Next chip in: {formatTime(120 - (afkTime % 120))}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setAfkActive(!afkActive)}
                  className={`flex-1 transition-all duration-300 ${afkActive ? "bg-destructive hover:bg-destructive/90" : "bg-green-500 hover:bg-green-600"}`}
                >
                  {afkActive ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Stop AFK
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start AFK Earning
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleClaimAfk}
                  variant="outline"
                  disabled={afkEarned === 0 || claimingAfk}
                  className="flex-1 bg-transparent"
                >
                  {claimingAfk ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                  Claim ¢{afkEarned} Chips
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Keep this tab open and active to continue earning. Closing or switching tabs will pause earnings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral Tab */}
        <TabsContent value="referral">
          <div className="space-y-4">
            {/* Your Referral Code */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <Users className="absolute top-4 right-4 h-24 w-24 rotate-12" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/20 shadow-lg shadow-primary/10">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Your Referral Code</CardTitle>
                    <CardDescription>
                      Share this code with friends. You both get ¢50 chips when they sign up!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-border/50 font-mono text-lg text-center">
                    {referralData?.referralCode || "Loading..."}
                  </div>
                  <Button onClick={copyReferralCode} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {referralData?.referralCount > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-500">
                      You've referred <span className="font-bold">{referralData.referralCount}</span> users and earned{" "}
                      <span className="font-bold">¢{referralData.referralCount * 50}</span> chips!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enter Referral Code */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <Sparkles className="absolute bottom-4 left-4 h-20 w-20 -rotate-12" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 shadow-lg shadow-amber-500/10">
                    <Coins className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle>Enter Referral Code</CardTitle>
                    <CardDescription>
                      Have a friend's referral code? Enter it here to get ¢50 bonus chips!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {referralData?.hasUsedReferral ? (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">You've already used a referral code.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="referralInput">Referral Code</Label>
                      <Input
                        id="referralInput"
                        placeholder="Enter friend's referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="font-mono"
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReferral}
                      disabled={submittingReferral || !referralCode.trim()}
                      className="w-full"
                    >
                      {submittingReferral ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Gift className="mr-2 h-4 w-4" />
                      )}
                      Apply Referral Code
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

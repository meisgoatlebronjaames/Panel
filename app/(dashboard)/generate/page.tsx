"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Sparkles, Loader2, Key, Settings, Coins } from "lucide-react"
import { InsufficientBalanceDialog } from "@/components/insufficient-balance-dialog"
import { calculateKeyCost } from "@/lib/license-utils"
import { formatNumber } from "@/lib/format-utils"

export default function GenerateKeyPage() {
  const [loading, setLoading] = useState(false)
  const [useCustomKey, setUseCustomKey] = useState(false)
  const [customKey, setCustomKey] = useState("")
  const [customKeyError, setCustomKeyError] = useState("")
  const [days, setDays] = useState("1")
  const [maxDevices, setMaxDevices] = useState("10")
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)

  const [insufficientBalance, setInsufficientBalance] = useState<{
    open: boolean
    required: number
    current: number
    needed: number
  }>({
    open: false,
    required: 0,
    current: 0,
    needed: 0,
  })

  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user:", error)
    } finally {
      setUserLoading(false)
    }
  }

  useEffect(() => {
    const daysNum = days === "lifetime" ? -1 : Number.parseInt(days)
    const devicesNum = Number.parseInt(maxDevices) || 1
    const cost = calculateKeyCost(daysNum, devicesNum)
    setEstimatedCost(cost)
  }, [days, maxDevices])

  const validateCustomKey = (value: string) => {
    const alphanumericOnly = value.replace(/[^a-zA-Z0-9]/g, "")
    setCustomKey(alphanumericOnly)

    if (alphanumericOnly.length > 0 && alphanumericOnly.length < 5) {
      setCustomKeyError("Minimum 5 characters")
    } else if (alphanumericOnly.length > 10) {
      setCustomKeyError("Maximum 10 characters")
    } else {
      setCustomKeyError("")
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useCustomKey) {
      if (customKey.length < 5 || customKey.length > 10) {
        toast.error("Custom key must be 5-10 alphanumeric characters")
        return
      }
    }

    setLoading(true)

    try {
      const daysNum = days === "lifetime" ? -1 : Number.parseInt(days, 10)
      const devicesNum = Number.parseInt(maxDevices, 10)

      if (isNaN(devicesNum) || devicesNum < 1) {
        toast.error("Invalid number of devices")
        setLoading(false)
        return
      }

      if (days !== "lifetime" && (isNaN(daysNum) || daysNum < 1)) {
        toast.error("Invalid expiry duration")
        setLoading(false)
        return
      }

      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: daysNum,
          maxDevices: devicesNum,
          customKey: useCustomKey ? customKey : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`License key generated successfully! Cost: ¢${data.balanceDeducted} chips`)
        router.push("/licenses")
        router.refresh()
      } else if (data.error === "Insufficient balance") {
        setInsufficientBalance({
          open: true,
          required: data.required,
          current: data.current,
          needed: data.needed,
        })
      } else {
        toast.error(data.error || "Failed to generate key")
      }
    } catch (error) {
      console.error("[v0] Key generation error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Generate License Key</h1>
        <p className="text-sm md:text-base text-muted-foreground">Create a new license key for your application</p>
      </div>

      <Card className="relative overflow-hidden">
        {/* Background decorative icons */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <Key className="absolute top-4 right-4 h-24 w-24 rotate-12" />
          <Settings className="absolute bottom-4 left-4 h-20 w-20 -rotate-12" />
        </div>

        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 shadow-lg shadow-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">Key Configuration</CardTitle>
              <CardDescription className="text-xs md:text-sm">Configure your license key settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <form onSubmit={handleGenerate} className="space-y-4 md:space-y-6">
            {/* Custom Key Toggle */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
              <Label htmlFor="custom-key" className="flex flex-col space-y-1">
                <span className="text-sm flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <Key className="h-3 w-3 text-primary" />
                  </div>
                  Use Custom Key
                </span>
                <span className="text-[10px] md:text-xs font-normal text-muted-foreground">
                  Enable to specify your own license key
                </span>
              </Label>
              <Switch id="custom-key" checked={useCustomKey} onCheckedChange={setUseCustomKey} />
            </div>

            {useCustomKey && (
              <div className="space-y-2">
                <Label htmlFor="customKey" className="text-sm flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <Key className="h-3 w-3 text-primary" />
                  </div>
                  Custom License Key
                </Label>
                <Input
                  id="customKey"
                  placeholder="Enter 5-10 alphanumeric characters"
                  value={customKey}
                  onChange={(e) => validateCustomKey(e.target.value)}
                  required={useCustomKey}
                  maxLength={10}
                  className="text-sm font-mono uppercase"
                />
                <div className="flex justify-between text-[10px]">
                  <span className={customKeyError ? "text-destructive" : "text-muted-foreground"}>
                    {customKeyError || "Only letters and numbers allowed"}
                  </span>
                  <span
                    className={
                      customKey.length < 5 || customKey.length > 10 ? "text-destructive" : "text-muted-foreground"
                    }
                  >
                    {customKey.length}/10
                  </span>
                </div>
              </div>
            )}

            {/* Expiry Selector */}
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-sm flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Settings className="h-3 w-3 text-primary" />
                </div>
                Expiry Duration
              </Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger id="expiry" className="text-sm">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Devices */}
            <div className="space-y-2">
              <Label htmlFor="maxDevices" className="text-sm flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Settings className="h-3 w-3 text-primary" />
                </div>
                Maximum Devices
              </Label>
              <Input
                id="maxDevices"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={maxDevices}
                onChange={(e) => setMaxDevices(e.target.value)}
                required
                className="text-sm"
              />
              <p className="text-[10px] md:text-xs text-muted-foreground">Every 10 devices costs ¢10 chips</p>
            </div>

            {/* Cost Preview */}
            <div className="rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-4 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Estimated Cost:
                </span>
                <span className="text-xl md:text-2xl font-bold text-foreground">
                  ¢{formatNumber(estimatedCost)}{" "}
                  <span className="text-xs md:text-sm font-normal text-muted-foreground">chips</span>
                </span>
              </div>
              {user && (
                <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                  <span className="text-[10px] md:text-xs text-muted-foreground">Your Chips:</span>
                  <span
                    className={`text-xs md:text-sm font-medium ${user.balance >= estimatedCost ? "text-green-500" : "text-destructive"}`}
                  >
                    ¢{formatNumber(user.balance)}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full transition-all duration-300 hover:scale-[1.01]"
              disabled={loading || (useCustomKey && (customKey.length < 5 || customKey.length > 10))}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Key
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Insufficient Balance Dialog */}
      <InsufficientBalanceDialog
        open={insufficientBalance.open}
        onOpenChange={(open) => setInsufficientBalance({ ...insufficientBalance, open })}
        required={insufficientBalance.required}
        current={insufficientBalance.current}
        needed={insufficientBalance.needed}
      />
    </div>
  )
}

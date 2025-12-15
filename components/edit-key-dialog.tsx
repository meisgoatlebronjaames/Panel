"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"
import { calculateUpgradeCost } from "@/lib/license-utils"
import { formatNumber } from "@/lib/format-utils"

interface EditKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  keyData: {
    id: number
    license_key: string
    expiry_date: string | null
    is_lifetime: boolean
    max_devices: number
  }
  onSuccess: () => void
}

export function EditKeyDialog({ open, onOpenChange, keyData, onSuccess }: EditKeyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [expiry, setExpiry] = useState(keyData.is_lifetime ? "lifetime" : calculateDaysFromExpiry(keyData.expiry_date))
  const [maxDevices, setMaxDevices] = useState(keyData.max_devices.toString())
  const [upgradeCost, setUpgradeCost] = useState(0)
  const [userBalance, setUserBalance] = useState(0)

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUserBalance(data.user?.balance ?? 0)
        } else {
          // User not authenticated or other error - default to 0
          setUserBalance(0)
        }
      } catch {
        // Network error or other issue - default to 0
        setUserBalance(0)
      }
    }
    if (open) fetchBalance()
  }, [open])

  useEffect(() => {
    const currentDays = keyData.is_lifetime ? -1 : calculateDaysFromExpiryNum(keyData.expiry_date)
    const newDays = expiry === "lifetime" ? -1 : Number.parseInt(expiry)
    const currentDevices = keyData.max_devices
    const newDevices = Number.parseInt(maxDevices) || currentDevices

    const cost = calculateUpgradeCost(currentDays, newDays, currentDevices, newDevices)
    setUpgradeCost(cost)
  }, [expiry, maxDevices, keyData])

  function calculateDaysFromExpiry(expiryDate: string | null): string {
    if (!expiryDate) return "1"
    const now = new Date()
    const exp = new Date(expiryDate)
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 1) return "1"
    if (diffDays <= 3) return "3"
    if (diffDays <= 7) return "7"
    if (diffDays <= 14) return "14"
    return "30"
  }

  function calculateDaysFromExpiryNum(expiryDate: string | null): number {
    if (!expiryDate) return 1
    const now = new Date()
    const exp = new Date(expiryDate)
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 1) return 1
    if (diffDays <= 3) return 3
    if (diffDays <= 7) return 7
    if (diffDays <= 14) return 14
    return 30
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const expiryNum = expiry === "lifetime" ? -1 : Number.parseInt(expiry)
      const devicesNum = Number.parseInt(maxDevices)

      const res = await fetch(`/api/keys/${keyData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiry: expiryNum,
          maxDevices: devicesNum,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.chipsDeducted > 0) {
          toast.success(`License key updated! ¢${data.chipsDeducted} chips deducted for the upgrade.`)
        } else {
          toast.success("License key updated successfully")
        }
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(data.error || "Failed to update key")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const canAfford = userBalance >= upgradeCost

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit License Key</DialogTitle>
          <DialogDescription>Update the expiry date and device limit for this license key</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>License Key</Label>
            <Input value={keyData.license_key} readOnly className="font-mono" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Duration</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger id="expiry">
                <SelectValue />
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

          <div className="space-y-2">
            <Label htmlFor="maxDevices">Maximum Devices</Label>
            <Input
              id="maxDevices"
              type="number"
              min="1"
              value={maxDevices}
              onChange={(e) => setMaxDevices(e.target.value)}
              required
            />
          </div>

          {upgradeCost > 0 && (
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Upgrade Cost:</span>
                <span className="text-lg font-bold text-destructive">-¢{formatNumber(upgradeCost)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Your Balance:</span>
                <span className={canAfford ? "text-green-500" : "text-destructive"}>¢{formatNumber(userBalance)}</span>
              </div>
              {!canAfford && (
                <div className="flex items-center gap-2 text-xs text-destructive mt-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Insufficient chips. You need ¢{formatNumber(upgradeCost - userBalance)} more.</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (upgradeCost > 0 && !canAfford)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : upgradeCost > 0 ? (
                `Save & Pay ¢${formatNumber(upgradeCost)}`
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

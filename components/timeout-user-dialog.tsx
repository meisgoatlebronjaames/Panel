"use client"

import type React from "react"
import { useState } from "react"
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
import { toast } from "sonner"
import { Loader2, Clock } from "lucide-react"

interface TimeoutUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  username: string
  onSuccess: () => void
}

export function TimeoutUserDialog({ open, onOpenChange, userId, username, onSuccess }: TimeoutUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [hours, setHours] = useState("24")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${userId}/timeout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: Number.parseInt(hours) }),
      })

      if (res.ok) {
        toast.success(`User ${username} has been timed out for ${hours} hours`)
        onSuccess()
        onOpenChange(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to timeout user")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <DialogTitle className="text-center">Timeout User</DialogTitle>
          <DialogDescription className="text-center">
            Set a timeout for <span className="font-semibold">{username}</span>. They will see a popup with a countdown
            timer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Timeout Duration (Hours)</Label>
            <Input
              id="hours"
              type="number"
              min="1"
              placeholder="e.g., 24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">The user will be timed out for this many hours</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting...
                </>
              ) : (
                "Set Timeout"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock } from "lucide-react"

interface TimeoutModalProps {
  timeoutUntil: string
  adminName: string
}

export function TimeoutModal({ timeoutUntil, adminName }: TimeoutModalProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const end = new Date(timeoutUntil)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Timeout expired")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [timeoutUntil])

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl">You Have Been Timed Out</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-center">
            <p className="text-base">
              You have been timed out by <span className="font-semibold">{adminName}</span>
            </p>
            <div className="rounded-lg bg-muted p-6">
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{timeLeft}</p>
            </div>
            <p className="text-sm text-muted-foreground">You will regain access once the countdown reaches zero.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}

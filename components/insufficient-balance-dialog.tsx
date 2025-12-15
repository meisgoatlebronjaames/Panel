"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { formatNumber } from "@/lib/format-utils"

interface InsufficientBalanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  required: number
  current: number
  needed: number
}

export function InsufficientBalanceDialog({
  open,
  onOpenChange,
  required,
  current,
  needed,
}: InsufficientBalanceDialogProps) {
  const router = useRouter()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">Insufficient Chips</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-center">
            <p className="text-base">Sorry, but you can't generate keys because you don't have enough chips.</p>
            <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span>Current Chips:</span>
                <span className="font-semibold text-foreground">¢{formatNumber(current)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Required:</span>
                <span className="font-semibold text-foreground">¢{formatNumber(required)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                <span>You Need:</span>
                <span className="text-destructive">+¢{formatNumber(needed)}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="w-full sm:w-auto">Close</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push("/buy-chips")} className="w-full sm:w-auto">
            Buy Chips
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

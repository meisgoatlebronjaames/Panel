"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"

interface LoginRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginRequiredDialog({ open, onOpenChange }: LoginRequiredDialogProps) {
  const router = useRouter()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Login Required</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You need to be logged in to generate license keys. Please login or create an account to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.push("/login")}>Login Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

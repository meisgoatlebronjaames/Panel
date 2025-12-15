"use client"
import { useState } from "react"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface DeleteKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  keyId: number
  licenseKey: string
  onSuccess: () => void
}

export function DeleteKeyDialog({ open, onOpenChange, keyId, licenseKey, onSuccess }: DeleteKeyDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/keys/${keyId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("License key deleted successfully")
        onSuccess()
        onOpenChange(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete key")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">This action cannot be undone. This will permanently delete the license key:</span>
            <code className="block rounded bg-muted p-2 text-sm">{licenseKey}</code>
            <span className="block font-semibold text-destructive">This key will be deleted and never come back.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Key"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

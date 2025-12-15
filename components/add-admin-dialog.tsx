"use client"
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
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  uid: string
  email: string
  username: string
  role: string
}

interface AddAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddAdminDialog({ open, onOpenChange, onSuccess }: AddAdminDialogProps) {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchUsers = async () => {
    setSearching(true)
    try {
      const res = await fetch(`/api/owner/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!selectedUser) return

    setLoading(true)

    try {
      const res = await fetch("/api/owner/admins/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      })

      if (res.ok) {
        toast.success(`${selectedUser.username} has been promoted to admin`)
        onSuccess()
        onOpenChange(false)
        setSearchQuery("")
        setSelectedUser(null)
        setSearchResults([])
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to add admin")
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
          <DialogTitle>Add Admin</DialogTitle>
          <DialogDescription>Search for a user and promote them to admin</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search User</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by email, username, or UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    selectedUser?.id === user.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs opacity-80">{user.email}</p>
                    </div>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={selectedUser?.id === user.id ? "bg-primary-foreground text-primary" : ""}
                    >
                      {user.role}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No users found</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddAdmin} disabled={loading || !selectedUser}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Admin"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

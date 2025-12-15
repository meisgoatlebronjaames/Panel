"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Crown, Loader2, Trash, UserPlus, Search, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Owner {
  id: number
  uid: string
  email: string
  username: string
  role: string
  balance: number
  created_at: string
}

export default function OwnerConfigPage() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  // Search fields
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Owner[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Owner | null>(null)
  const [searchError, setSearchError] = useState("")

  // Remove dialog
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; owner: Owner | null }>({
    open: false,
    owner: null,
  })

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/owner/config")
      if (res.ok) {
        const data = await res.json()
        setOwners(data.owners)
      } else {
        toast.error("Failed to load owners")
      }
    } catch (error) {
      toast.error("Failed to load owners")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = async () => {
    setSearching(true)
    setSearchError("")

    try {
      const res = await fetch(`/api/owner/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.users)
      } else {
        setSearchError("Failed to search users")
      }
    } catch (error) {
      setSearchError("Failed to search users")
    } finally {
      setSearching(false)
    }
  }

  const handleAddOwner = async () => {
    if (!selectedUser) return

    setAddLoading(true)

    try {
      const res = await fetch("/api/owner/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      })

      if (res.ok) {
        toast.success(`${selectedUser.username} has been promoted to owner!`)
        setSelectedUser(null)
        setSearchQuery("")
        setSearchResults([])
        fetchOwners()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to add owner")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setAddLoading(false)
    }
  }

  const handleRemoveOwner = async () => {
    if (!removeDialog.owner) return

    try {
      const res = await fetch(`/api/owner/config/${removeDialog.owner.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(`${removeDialog.owner.username} has been demoted from owner`)
        fetchOwners()
        setRemoveDialog({ open: false, owner: null })
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to remove owner")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Owner Configuration</h1>
        <p className="text-muted-foreground">Manage panel owners using email, username, or UID</p>
      </div>

      {/* Add Owner Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Owner</CardTitle>
          <CardDescription>Search for a user by their email, username, or UID to promote them to owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    selectedUser?.id === user.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs opacity-80">{user.email}</p>
                      <p className="text-xs opacity-70 font-mono">UID: {user.uid}</p>
                    </div>
                    <Badge
                      variant="secondary"
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

          {searchError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {searchError}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-xs font-mono text-muted-foreground">UID: {selectedUser.uid}</p>
                  <Badge variant={selectedUser.role === "owner" ? "default" : "secondary"} className="mt-2">
                    Current Role: {selectedUser.role}
                  </Badge>
                </div>
                <Button onClick={handleAddOwner} disabled={addLoading || selectedUser.role === "owner"}>
                  {addLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedUser.role === "owner" ? (
                    "Already Owner"
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Make Owner
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Owners List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Owners</CardTitle>
          <CardDescription>Users with owner privileges on this panel</CardDescription>
        </CardHeader>
        <CardContent>
          {owners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Crown className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No owners configured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>UID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">{owner.username}</TableCell>
                      <TableCell className="font-mono text-xs">{owner.uid}</TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>{owner.balance}</TableCell>
                      <TableCell>{format(new Date(owner.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveDialog({ open: true, owner })}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Owner Dialog */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ open, owner: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Owner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove owner privileges from <strong>{removeDialog.owner?.username}</strong>?
              They will be demoted to a regular user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveOwner} className="bg-destructive hover:bg-destructive/90">
              Remove Owner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimeoutUserDialog } from "@/components/timeout-user-dialog"
import { MoreVertical, Trash, Clock, XCircle, Loader2, Edit } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatNumber } from "@/lib/format-utils"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface User {
  id: number
  uid: string
  email: string
  username: string
  role: string
  balance: number
  is_timed_out: boolean
  timeout_until: string | null
  created_at: string
  total_keys: number
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "owner":
      return "bg-purple-500 text-white hover:bg-purple-600"
    case "admin":
      return "bg-blue-500 text-white hover:bg-blue-600"
    default:
      return "bg-gray-500 text-white hover:bg-gray-600"
  }
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [timeoutDialog, setTimeoutDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [editUsernameDialog, setEditUsernameDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [newUsername, setNewUsername] = useState("")
  const [updatingUsername, setUpdatingUsername] = useState(false)
  const [removing, setRemoving] = useState<number | null>(null)

  const { data: currentUser } = useSWR("/api/auth/me", fetcher)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else {
        toast.error("Failed to load users")
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.user) return

    try {
      const res = await fetch(`/api/admin/users/${deleteDialog.user.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(`User ${deleteDialog.user.username} deleted successfully`)
        fetchUsers()
        setDeleteDialog({ open: false, user: null })
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    }
  }

  const handleRemoveTimeout = async (userId: number) => {
    setRemoving(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/timeout`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Timeout removed successfully")
        fetchUsers()
      } else {
        toast.error("Failed to remove timeout")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setRemoving(null)
    }
  }

  const handleUpdateUsername = async () => {
    if (!editUsernameDialog.user || !newUsername.trim()) return

    setUpdatingUsername(true)
    try {
      const res = await fetch(`/api/admin/users/${editUsernameDialog.user.id}/username`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() }),
      })

      if (res.ok) {
        toast.success(`Username updated successfully`)
        fetchUsers()
        setEditUsernameDialog({ open: false, user: null })
        setNewUsername("")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update username")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setUpdatingUsername(false)
    }
  }

  const isOwner = currentUser?.role === "owner"

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
        <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All registered users in the panel</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>UID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Total Keys</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="font-mono text-xs">{user.uid}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeClass(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>¢{formatNumber(user.balance)}</TableCell>
                      <TableCell>{user.total_keys}</TableCell>
                      <TableCell>
                        {user.is_timed_out ? (
                          <Badge variant="destructive">Timed Out</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(user.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isOwner && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setNewUsername(user.username)
                                    setEditUsernameDialog({ open: true, user })
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Username
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {user.is_timed_out ? (
                              <DropdownMenuItem
                                onClick={() => handleRemoveTimeout(user.id)}
                                disabled={removing === user.id}
                              >
                                {removing === user.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Remove Timeout
                                  </>
                                )}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setTimeoutDialog({ open: true, user })}>
                                <Clock className="mr-2 h-4 w-4" />
                                Timeout User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, user })}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{deleteDialog.user?.username}</strong> and all their license
              keys. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={editUsernameDialog.open}
        onOpenChange={(open) => {
          setEditUsernameDialog({ open, user: open ? editUsernameDialog.user : null })
          if (!open) setNewUsername("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Username</DialogTitle>
            <DialogDescription>
              Change the username for <strong>{editUsernameDialog.user?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUsernameDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUsername} disabled={updatingUsername || !newUsername.trim()}>
              {updatingUsername ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeout Dialog */}
      {timeoutDialog.user && (
        <TimeoutUserDialog
          open={timeoutDialog.open}
          onOpenChange={(open) => setTimeoutDialog({ open, user: null })}
          userId={timeoutDialog.user.id}
          username={timeoutDialog.user.username}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  )
}

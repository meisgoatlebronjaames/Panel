"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { AddAdminDialog } from "@/components/add-admin-dialog"
import { UserPlus, Trash, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { formatNumber } from "@/lib/format-utils"

interface Admin {
  id: number
  uid: string
  email: string
  username: string
  role: string
  balance: number
  created_at: string
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialog, setAddDialog] = useState(false)
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; admin: Admin | null }>({
    open: false,
    admin: null,
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/owner/admins")
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins)
      } else {
        toast.error("Failed to load admins")
      }
    } catch (error) {
      toast.error("Failed to load admins")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!removeDialog.admin) return

    try {
      const res = await fetch(`/api/owner/admins/${removeDialog.admin.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(`${removeDialog.admin.username} has been demoted to regular user`)
        fetchAdmins()
        setRemoveDialog({ open: false, admin: null })
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to remove admin")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Admins</h1>
          <p className="text-muted-foreground">Add or remove admin permissions</p>
        </div>
        <Button onClick={() => setAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
          <CardDescription>All users with the admin role</CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No admins found</p>
              <Button className="mt-4" onClick={() => setAddDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add First Admin
              </Button>
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
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.username}</TableCell>
                      <TableCell className="font-mono text-xs">{admin.uid}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>¢{formatNumber(admin.balance)}</TableCell>
                      <TableCell>{format(new Date(admin.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveDialog({ open: true, admin })}
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

      {/* Add Admin Dialog - onSuccess now refreshes the list to show updated roles */}
      <AddAdminDialog open={addDialog} onOpenChange={setAddDialog} onSuccess={fetchAdmins} />

      {/* Remove Admin Dialog */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ open, admin: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove admin privileges from <strong>{removeDialog.admin?.username}</strong>?
              They will be demoted to a regular user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive hover:bg-destructive/90">
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

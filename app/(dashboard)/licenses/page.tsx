"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditKeyDialog } from "@/components/edit-key-dialog"
import { DeleteKeyDialog } from "@/components/delete-key-dialog"
import { MoreVertical, Edit, Trash, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface LicenseKey {
  id: number
  license_key: string
  expiry_date: string | null
  is_lifetime: boolean
  max_devices: number
  devices_used: number
  status: string
  created_at: string
}

export default function LicensesPage() {
  const [keys, setKeys] = useState<LicenseKey[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState<{ open: boolean; key: LicenseKey | null }>({
    open: false,
    key: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; licenseKey: string }>({
    open: false,
    id: 0,
    licenseKey: "",
  })

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys")
      if (res.ok) {
        const data = await res.json()
        setKeys(data.keys)
      }
    } catch (error) {
      toast.error("Failed to load license keys")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusBadge = (key: LicenseKey) => {
    if (key.status === "expired") {
      return <Badge variant="destructive">Expired</Badge>
    }

    if (!key.is_lifetime && key.expiry_date) {
      const expiryDate = new Date(key.expiry_date)
      if (expiryDate < new Date()) {
        return <Badge variant="destructive">Expired</Badge>
      }
    }

    return <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My License Keys</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your generated license keys</p>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">License Keys</CardTitle>
          <CardDescription className="text-xs md:text-sm">View and manage all your license keys</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
              <p className="text-sm text-muted-foreground">No license keys found</p>
              <Button className="mt-4" size="sm" onClick={() => (window.location.href = "/generate")}>
                Generate Your First Key
              </Button>
            </div>
          ) : (
            <>
              <div className="block md:hidden space-y-3">
                {keys.map((key) => (
                  <div key={key.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => copyToClipboard(key.license_key)}
                        className="font-mono text-xs hover:text-primary flex items-center gap-1 truncate max-w-[200px]"
                      >
                        {key.license_key}
                        <Copy className="h-3 w-3 flex-shrink-0" />
                      </button>
                      {getStatusBadge(key)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Expiry:</span>{" "}
                        {key.is_lifetime
                          ? "Lifetime"
                          : key.expiry_date
                            ? format(new Date(key.expiry_date), "MMM dd, yyyy")
                            : "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Devices:</span>{" "}
                        <span className={key.devices_used >= key.max_devices ? "text-destructive" : ""}>
                          {key.devices_used}/{key.max_devices}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-[10px] text-muted-foreground">
                        Created: {format(new Date(key.created_at), "MMM dd, yyyy")}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditDialog({ open: true, key })}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, id: key.id, licenseKey: key.license_key })}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>License Key</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Devices</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-mono text-sm">
                          <button
                            onClick={() => copyToClipboard(key.license_key)}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            {key.license_key}
                            <Copy className="h-3 w-3" />
                          </button>
                        </TableCell>
                        <TableCell>
                          {key.is_lifetime
                            ? "Lifetime"
                            : key.expiry_date
                              ? format(new Date(key.expiry_date), "MMM dd, yyyy")
                              : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(key)}</TableCell>
                        <TableCell>
                          <span className={key.devices_used >= key.max_devices ? "font-semibold text-destructive" : ""}>
                            {key.devices_used} / {key.max_devices}
                          </span>
                        </TableCell>
                        <TableCell>{format(new Date(key.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditDialog({ open: true, key })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({ open: true, id: key.id, licenseKey: key.license_key })}
                                className="text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editDialog.key && (
        <EditKeyDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, key: null })}
          keyData={editDialog.key}
          onSuccess={fetchKeys}
        />
      )}

      {/* Delete Dialog */}
      <DeleteKeyDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        keyId={deleteDialog.id}
        licenseKey={deleteDialog.licenseKey}
        onSuccess={fetchKeys}
      />
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, Send, RefreshCw, Megaphone } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Update {
  id: number
  version: string
  update_message: string
  is_forced: boolean
  created_at: string
  created_by: string
}

export default function AppUpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [version, setVersion] = useState("")
  const [updateMessage, setUpdateMessage] = useState("")

  const [announcementSubject, setAnnouncementSubject] = useState("")
  const [announcementBody, setAnnouncementBody] = useState("")
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      const res = await fetch("/api/admin/updates")
      if (res.ok) {
        const data = await res.json()
        setUpdates(data.updates)
      }
    } catch (error) {
      toast.error("Failed to load updates")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, updateMessage }),
      })

      if (res.ok) {
        toast.success("Update notification created successfully")
        setVersion("")
        setUpdateMessage("")
        fetchUpdates()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create update")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingAnnouncement(true)

    try {
      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: announcementSubject,
          body: announcementBody,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(data.message || "Announcement sent to all users!")
        setAnnouncementSubject("")
        setAnnouncementBody("")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send announcement")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setSendingAnnouncement(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">App Updates</h1>
        <p className="text-muted-foreground">Push update requirements to APK users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            Send Announcement
          </CardTitle>
          <CardDescription>
            Send a message to all users in the panel. This will appear in everyone's inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcementSubject">Subject</Label>
              <Input
                id="announcementSubject"
                placeholder="e.g., Important Update"
                value={announcementSubject}
                onChange={(e) => setAnnouncementSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcementBody">Message</Label>
              <Textarea
                id="announcementBody"
                placeholder="Write your announcement message..."
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to all users' inboxes, including yourself
              </p>
            </div>

            <Button type="submit" disabled={sendingAnnouncement} className="gap-2">
              {sendingAnnouncement ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending to all users...
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4" />
                  Send Announcement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Create Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Push New Update</CardTitle>
          <CardDescription>
            Send an update notification to all APK users. This will force them to update before using the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., v2.0.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="updateMessage">Update Message</Label>
              <Textarea
                id="updateMessage"
                placeholder="Describe what's new in this update..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent via Discord or Telegram to notify users
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Update
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Update History */}
      <Card>
        <CardHeader>
          <CardTitle>Update History</CardTitle>
          <CardDescription>All sent update notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No updates sent yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell className="font-mono font-semibold">{update.version}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2 text-sm">{update.update_message}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={update.is_forced ? "destructive" : "secondary"}>
                          {update.is_forced ? "Forced" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell>{update.created_by}</TableCell>
                      <TableCell>{format(new Date(update.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Loader2,
  Search,
  Mail,
  MailOpen,
  Star,
  StarOff,
  Trash2,
  Send,
  Inbox,
  SendHorizontal,
  Settings,
  MoreVertical,
  ArrowLeft,
  Megaphone,
  Bell,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  sender_id: number | null
  recipient_id: number
  subject: string
  body: string
  message_type: string
  is_read: boolean
  is_starred: boolean
  is_deleted: boolean
  created_at: string
  sender_username: string | null
  sender_email: string | null
  recipient_username: string
  recipient_email: string
}

interface User {
  id: number
  uid: string
  email: string
  username: string
  role: string
}

interface InboxSettings {
  notifications_enabled: boolean
  email_notifications: boolean
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"inbox" | "sent" | "starred">("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Compose dialog
  const [composeOpen, setComposeOpen] = useState(false)
  const [composing, setComposing] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState("")
  const [recipientResults, setRecipientResults] = useState<User[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [searchingRecipient, setSearchingRecipient] = useState(false)

  // Settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<InboxSettings>({
    notifications_enabled: true,
    email_notifications: false,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    fetchMessages()
    fetchUnreadCount()
    fetchSettings()
  }, [filter, searchQuery])

  useEffect(() => {
    if (recipientSearch.length >= 2) {
      const timer = setTimeout(() => searchRecipients(), 300)
      return () => clearTimeout(timer)
    } else {
      setRecipientResults([])
    }
  }, [recipientSearch])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inbox?filter=${filter}&search=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/inbox/unread-count")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("[v0] Fetch unread count error:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/inbox/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("[v0] Fetch settings error:", error)
    }
  }

  const searchRecipients = async () => {
    setSearchingRecipient(true)
    try {
      const res = await fetch(`/api/inbox/search-users?q=${encodeURIComponent(recipientSearch)}`)
      if (res.ok) {
        const data = await res.json()
        setRecipientResults(data.users)
      }
    } catch (error) {
      console.error("[v0] Search recipients error:", error)
    } finally {
      setSearchingRecipient(false)
    }
  }

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message)
    if (!message.is_read && filter !== "sent") {
      await fetch(`/api/inbox/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      })
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const handleToggleStar = async (message: Message, e: React.MouseEvent) => {
    e.stopPropagation()
    const action = message.is_starred ? "unstar" : "star"
    await fetch(`/api/inbox/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_starred: !m.is_starred } : m)))
    if (selectedMessage?.id === message.id) {
      setSelectedMessage({ ...selectedMessage, is_starred: !message.is_starred })
    }
  }

  const handleDelete = async (messageId: number) => {
    await fetch(`/api/inbox/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    })
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null)
    }
    toast.success("Message deleted")
  }

  const handleToggleRead = async (message: Message) => {
    const action = message.is_read ? "unread" : "read"
    await fetch(`/api/inbox/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: !m.is_read } : m)))
    setUnreadCount((prev) => (message.is_read ? prev + 1 : Math.max(0, prev - 1)))
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecipient) {
      toast.error("Please select a recipient")
      return
    }

    setComposing(true)
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedRecipient.id,
          subject,
          body,
        }),
      })

      if (res.ok) {
        toast.success("Message sent successfully")
        setComposeOpen(false)
        setSelectedRecipient(null)
        setRecipientSearch("")
        setSubject("")
        setBody("")
        fetchMessages()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send message")
      }
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setComposing(false)
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/inbox/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast.success("Settings saved")
        setSettingsOpen(false)
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSavingSettings(false)
    }
  }

  const getSenderDisplay = (message: Message) => {
    if (message.message_type === "announcement") {
      return "Xyriel Announcements"
    }
    if (message.message_type === "system") {
      return "System"
    }
    return message.sender_username || message.sender_email || "Unknown"
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] p-2 md:p-0">
      {/* Sidebar - horizontal on mobile, vertical on desktop */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <Button onClick={() => setComposeOpen(true)} className="w-full gap-2 h-10 md:h-12 text-sm md:text-base">
          <Send className="h-4 w-4 md:h-5 md:w-5" />
          Compose
        </Button>

        <Card>
          <CardContent className="p-2">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              <button
                onClick={() => setFilter("inbox")}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 md:py-3 text-sm transition-colors whitespace-nowrap flex-1 md:flex-none",
                  filter === "inbox" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  <span className="hidden sm:inline md:inline">Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <Badge variant={filter === "inbox" ? "secondary" : "default"} className="ml-2 md:ml-auto">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setFilter("starred")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 md:py-3 text-sm transition-colors whitespace-nowrap flex-1 md:flex-none",
                  filter === "starred" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline md:inline">Starred</span>
              </button>
              <button
                onClick={() => setFilter("sent")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 md:py-3 text-sm transition-colors whitespace-nowrap flex-1 md:flex-none",
                  filter === "sent" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <SendHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline md:inline">Sent</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="hidden md:flex w-full gap-2 bg-transparent h-10"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2 shrink-0 p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {selectedMessage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <CardTitle className="capitalize text-base md:text-xl truncate">
                  {selectedMessage ? selectedMessage.subject : filter}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchMessages}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!selectedMessage && (
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 md:h-10 text-sm"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
            {loading ? (
              <div className="flex h-full items-center justify-center py-8">
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
              </div>
            ) : selectedMessage ? (
              // Message Detail View
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full",
                        selectedMessage.message_type === "announcement"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-primary/20 text-primary",
                      )}
                    >
                      {selectedMessage.message_type === "announcement" ? (
                        <Megaphone className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Mail className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm md:text-base truncate">{getSenderDisplay(selectedMessage)}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {format(new Date(selectedMessage.created_at), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleToggleStar(selectedMessage, e)}
                    >
                      {selectedMessage.is_starred ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 md:p-4">
                  <p className="whitespace-pre-wrap text-sm md:text-base">{selectedMessage.body}</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 md:p-8">
                <Mail className="mb-3 md:mb-4 h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                <p className="text-sm md:text-base text-muted-foreground">No messages</p>
              </div>
            ) : (
              // Message List
              <div className="divide-y divide-border">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleOpenMessage(message)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 p-2 md:p-3 transition-colors hover:bg-muted/50",
                      !message.is_read && filter !== "sent" && "bg-primary/5 font-semibold",
                    )}
                  >
                    <button onClick={(e) => handleToggleStar(message, e)} className="shrink-0 p-1">
                      {message.is_starred ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>

                    <div
                      className={cn(
                        "hidden sm:flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full",
                        message.message_type === "announcement"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-primary/20 text-primary",
                      )}
                    >
                      {message.message_type === "announcement" ? (
                        <Megaphone className="h-3 w-3 md:h-4 md:w-4" />
                      ) : !message.is_read && filter !== "sent" ? (
                        <Mail className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <MailOpen className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 md:gap-2">
                        <p
                          className={cn(
                            "truncate text-xs md:text-sm",
                            !message.is_read && filter !== "sent" && "font-semibold",
                          )}
                        >
                          {filter === "sent"
                            ? message.recipient_username || message.recipient_email
                            : getSenderDisplay(message)}
                        </p>
                        <span className="shrink-0 text-[10px] md:text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "MMM dd")}
                        </span>
                      </div>
                      <p className="truncate text-xs md:text-sm text-muted-foreground">{message.subject}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-7 w-7 md:h-8 md:w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {filter !== "sent" && (
                          <DropdownMenuItem onClick={() => handleToggleRead(message)}>
                            {message.is_read ? (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Mark as unread
                              </>
                            ) : (
                              <>
                                <MailOpen className="mr-2 h-4 w-4" />
                                Mark as read
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => handleToggleStar(message, e as any)}>
                          {message.is_starred ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Remove star
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Add star
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(message.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">New Message</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Send a message to another user</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base">To</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by email, username, or UID..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="pl-10 h-10 md:h-11 text-sm"
                />
              </div>
              {searchingRecipient && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {recipientResults.length > 0 && (
                <div className="max-h-36 md:max-h-48 overflow-y-auto rounded-lg border p-1 space-y-1">
                  {recipientResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedRecipient(user)
                        setRecipientSearch(user.username)
                        setRecipientResults([])
                      }}
                      className={cn(
                        "w-full rounded-md p-2 md:p-3 text-left text-sm hover:bg-muted",
                        selectedRecipient?.id === user.id && "bg-primary/10",
                      )}
                    >
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedRecipient && (
                <Badge variant="secondary" className="gap-1 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3">
                  {selectedRecipient.username}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipient(null)
                      setRecipientSearch("")
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm md:text-base">
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="Message subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="h-10 md:h-11 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm md:text-base">
                Message
              </Label>
              <Textarea
                id="body"
                placeholder="Write your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                required
                className="min-h-[120px] md:min-h-[180px] resize-y text-sm md:text-base"
              />
            </div>
            <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setComposeOpen(false)}
                className="h-10 md:h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={composing || !selectedRecipient}
                className="h-10 md:h-11 w-full sm:w-auto"
              >
                {composing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Inbox Settings</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Manage your notification preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <Label className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 shrink-0" />
                  Notifications
                </Label>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Receive in-app notifications for new messages
                </p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <Label className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 shrink-0" />
                  Email Notifications
                </Label>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Receive email alerts for important messages
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={savingSettings} className="w-full sm:w-auto">
              {savingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

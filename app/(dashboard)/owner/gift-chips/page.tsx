"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Search, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  uid: string
  email: string
  username: string
  role: string
  balance: number
}

export default function GiftChipsPage() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      toast.error("Please select a user")
      return
    }

    const amountNum = Number.parseInt(amount)
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error("Please enter a valid amount")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/owner/gift-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: amountNum,
          message,
        }),
      })

      if (res.ok) {
        toast.success(`Successfully gifted ${amountNum} chips to ${selectedUser.username}`)
        setSelectedUser(null)
        setAmount("")
        setMessage("")
        setSearchQuery("")
        setSearchResults([])
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to gift chips")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gift Chips</h1>
        <p className="text-muted-foreground">Add chips to any user's account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Chips Gift
          </CardTitle>
          <CardDescription>Search for a user and add chips to their account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search User */}
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
                        <p className="mt-1 text-xs opacity-70">Current Chips: {user.balance}</p>
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

            {/* Selected User */}
            {selectedUser && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Selected User</p>
                <p className="font-semibold">{selectedUser.username}</p>
                <p className="text-sm text-muted-foreground">Current Chips: {selectedUser.balance}</p>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Chips Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="e.g., Thank you for your support!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Add a personal note with your gift</p>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading || !selectedUser}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gifting...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Gift Chips
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Key, Mail, Lock, Sparkles, Shield } from "lucide-react"
import { LoadingScreen } from "@/components/loading-screen"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Login successful")
        setShowLoading(true)
      } else {
        toast.error(data.error || "Login failed")
        setLoading(false)
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleLoadingComplete = () => {
    window.location.href = "/dashboard"
  }

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <Key className="absolute top-20 left-[10%] h-40 w-40 rotate-12" />
        <Sparkles className="absolute top-1/4 right-[15%] h-32 w-32 -rotate-12" />
        <Shield className="absolute bottom-20 left-[20%] h-36 w-36 rotate-45" />
        <Lock className="absolute bottom-1/4 right-[10%] h-28 w-28 -rotate-6" />
      </div>

      <Card className="relative w-full max-w-md border-white/10 bg-[#111118]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
        {/* Card background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <Key className="absolute -top-10 -right-10 h-40 w-40 rotate-12" />
          <Sparkles className="absolute -bottom-10 -left-10 h-32 w-32 -rotate-12" />
        </div>

        <CardHeader className="space-y-4 text-center pb-2 relative">
          {/* Logo/Icon with modern style */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/30 transition-transform duration-300 hover:scale-105">
                <Key className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#111118] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Welcome home</CardTitle>
            <CardDescription className="text-gray-400">Sign into your account</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4 relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Mail className="h-3 w-3 text-primary" />
                </div>
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1a1a24] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Lock className="h-3 w-3 text-primary" />
                </div>
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a1a24] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-white hover:bg-gray-100 text-black font-medium shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            New to Xyriel Panel?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Register
            </Link>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">© 2025 Xyriel Panel</div>
        </CardContent>
      </Card>
    </div>
  )
}

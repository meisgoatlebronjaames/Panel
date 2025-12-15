"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Wallet, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatNumber } from "@/lib/format-utils"

interface HeaderProps {
  user: {
    username: string
    email: string
    balance: number
    role: string
    profile_picture?: string | null
  }
}

function isChristmasSeason(): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const jan1 = new Date(year + 1, 0, 1) // January 1st next year
  const dec1 = new Date(year, 11, 1) // December 1st
  return now >= dec1 && now < jan1
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const showChristmas = isChristmasSeason()

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        toast.success("Logged out successfully")
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-3 md:px-6 relative overflow-hidden">
      {showChristmas && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="snowflake-header">❄</div>
          <div className="snowflake-header delay-1">❄</div>
          <div className="snowflake-header delay-2">✦</div>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-4 min-w-0 relative z-10">
        <h1 className="text-sm md:text-xl font-semibold text-foreground truncate">License Management</h1>
        {showChristmas && (
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-green-500 text-white text-xs font-medium animate-pulse">
            <Gift className="h-3 w-3" />
            <span>XMAS SALE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3 relative z-10">
        <div
          className={`flex items-center gap-1.5 md:gap-2 rounded-lg px-2 md:px-3 py-1 md:py-1.5 border ${showChristmas ? "bg-gradient-to-r from-red-500/10 to-green-500/10 border-red-500/30" : "bg-muted/50 border-border/50"}`}
        >
          <Wallet className={`h-3.5 w-3.5 md:h-4 md:w-4 ${showChristmas ? "text-red-400" : "text-primary"}`} />
          <span className="text-xs md:text-sm font-semibold text-foreground">¢{formatNumber(user.balance)}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all duration-200 focus:outline-none">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                {user.profile_picture && (
                  <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.username} />
                )}
                <AvatarFallback className="bg-primary/20 text-primary font-medium text-xs md:text-sm">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Background decorative icons */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <Settings className="absolute top-2 right-2 h-20 w-20 rotate-12" />
              <LogOut className="absolute bottom-4 left-2 h-16 w-16 -rotate-12" />
            </div>

            <DropdownMenuLabel className="p-4 bg-gradient-to-br from-primary/10 to-transparent relative">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                  {user.profile_picture && (
                    <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.username} />
                  )}
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-foreground">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate max-w-[140px]">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">¢{formatNumber(user.balance)}</span>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-border/50" />

            <div className="p-1.5 relative">
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-muted/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Settings</p>
                    <p className="text-xs text-muted-foreground">Manage your account</p>
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border/50 my-1.5" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-destructive/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                    <LogOut className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">Logout</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

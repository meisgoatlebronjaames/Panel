"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Crown,
  CreditCard,
  RefreshCw,
  ChevronRight,
  Settings,
  Key,
  Sparkles,
  Coins,
  Inbox,
} from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

interface SidebarProps {
  userRole: "user" | "admin" | "owner"
}

const PANEL_LOGO_URL = "/panel-logo.png"
const USE_CUSTOM_LOGO = false

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
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
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const userLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & stats" },
    { href: "/generate", label: "Generate Key", icon: Sparkles, description: "Create new licenses" },
    { href: "/licenses", label: "My Licenses", icon: Key, description: "Manage your keys" },
    { href: "/inbox", label: "Inbox", icon: Inbox, description: "Messages & alerts", badge: unreadCount },
    { href: "/buy-chips", label: "Buy Chips", icon: CreditCard, description: "Purchase credits" },
    { href: "/rewards", label: "Rewards", icon: Coins, description: "Earn free chips" },
  ]

  const adminLinks = [
    { href: "/admin/users", label: "Manage Users", icon: Users, description: "User management" },
    { href: "/admin/updates", label: "App Updates", icon: RefreshCw, description: "Version control" },
  ]

  const ownerLinks = [
    { href: "/owner/admins", label: "Manage Admins", icon: ShieldCheck, description: "Admin access" },
    { href: "/owner/gift-chips", label: "Gift Chips", icon: Crown, description: "Send chips" },
    { href: "/owner/config", label: "Owner Config", icon: Settings, description: "Panel settings" },
  ]

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  if (isMobile && !mobileMenuOpen) {
    return (
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex h-14 w-6 items-center justify-center rounded-r-lg bg-card border border-l-0 border-border/50 shadow-lg transition-all duration-200 hover:w-8 hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <>
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className={cn("relative flex h-screen", isMobile && "fixed left-0 top-0 z-50")}>
        <div
          className={cn(
            "flex h-screen flex-col border-r border-border/50 bg-card transition-all duration-300 relative overflow-hidden",
            isCollapsed ? "w-16" : "w-72",
          )}
        >
          {!isCollapsed && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
              <Key className="absolute top-20 right-4 h-32 w-32 rotate-12" />
              <Sparkles className="absolute top-1/3 left-2 h-24 w-24 -rotate-12" />
              <Settings className="absolute bottom-32 right-8 h-28 w-28 rotate-45" />
              <Crown className="absolute bottom-12 left-4 h-20 w-20 -rotate-6" />
            </div>
          )}

          <div className="flex h-20 items-center border-b border-border/50 px-4 bg-gradient-to-br from-primary/5 to-transparent relative">
            {!isCollapsed && (
              <div className="flex items-center gap-3 w-full justify-center">
                {USE_CUSTOM_LOGO ? (
                  <Image
                    src={PANEL_LOGO_URL || "/placeholder.svg"}
                    alt="Panel Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 ring-2 ring-primary/30 shadow-lg">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex flex-col items-center relative">
                  <span className="text-2xl tracking-wider robotic-blue-text">XYRIEL</span>
                  <span className="text-[10px] font-medium tracking-widest uppercase robotic-blue-text-sm">
                    License Panel
                  </span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto">
                {USE_CUSTOM_LOGO ? (
                  <Image
                    src={PANEL_LOGO_URL || "/placeholder.svg"}
                    alt="Panel Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-3 relative scrollbar-hide">
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="mb-3 px-3 text-[10px] font-semibold uppercase text-muted-foreground/70 tracking-widest">
                  Navigation
                </div>
              )}
              {userLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    title={isCollapsed ? link.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group",
                      isActive
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/80 border border-transparent",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200 relative",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-muted/80 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {isCollapsed && link.badge && link.badge > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                          {link.badge > 9 ? "9+" : link.badge}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {link.label}
                          </span>
                          {link.badge && link.badge > 0 && (
                            <Badge variant="destructive" className="h-5 text-[10px]">
                              {link.badge > 99 ? "99+" : link.badge}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground/70">{link.description}</span>
                      </div>
                    )}
                    {!isCollapsed && isActive && !link.badge && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </div>

            {(userRole === "admin" || userRole === "owner") && (
              <div className="mt-6 space-y-1">
                {!isCollapsed && (
                  <div className="mb-3 px-3 text-[10px] font-semibold uppercase text-muted-foreground/70 tracking-widest flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/50" />
                    <span>Admin</span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                )}
                {isCollapsed && <div className="h-px w-8 mx-auto bg-border/50 my-2" />}
                {adminLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      title={isCollapsed ? link.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group",
                        isActive
                          ? "bg-amber-500/10 border border-amber-500/20"
                          : "hover:bg-muted/80 border border-transparent",
                        isCollapsed && "justify-center px-2",
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                            : "bg-muted/80 text-muted-foreground group-hover:bg-amber-500/20 group-hover:text-amber-500",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">{link.description}</span>
                        </div>
                      )}
                      {!isCollapsed && isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            {userRole === "owner" && (
              <div className="mt-6 space-y-1">
                {!isCollapsed && (
                  <div className="mb-3 px-3 text-[10px] font-semibold uppercase text-muted-foreground/70 tracking-widest flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/50" />
                    <span>Owner</span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                )}
                {isCollapsed && <div className="h-px w-8 mx-auto bg-border/50 my-2" />}
                {ownerLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      title={isCollapsed ? link.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group",
                        isActive
                          ? "bg-purple-500/10 border border-purple-500/20"
                          : "hover:bg-muted/80 border border-transparent",
                        isCollapsed && "justify-center px-2",
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-muted/80 text-muted-foreground group-hover:bg-purple-500/20 group-hover:text-purple-500",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">{link.description}</span>
                        </div>
                      )}
                      {!isCollapsed && isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </nav>

          {!isCollapsed && (
            <div className="p-4 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent">
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
                <span>Xyriel Panel</span>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
            </div>
          )}
        </div>

        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50 shadow-lg transition-all duration-200 hover:bg-primary hover:border-primary hover:text-primary-foreground group"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-primary-foreground",
                !isCollapsed && "rotate-180",
              )}
            />
          </button>
        )}

        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50 shadow-lg"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
          </button>
        )}
      </div>
    </>
  )
}

import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Coins, Users, Activity, Sparkles, CreditCard, Shield } from "lucide-react"
import { formatNumber } from "@/lib/format-utils"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get user statistics
  const keysResult = await sql`
    SELECT COUNT(*) as count FROM license_keys WHERE user_id = ${user.id} AND status = 'active'
  `
  const totalKeys = keysResult[0]?.count || 0

  const expiredKeysResult = await sql`
    SELECT COUNT(*) as count FROM license_keys 
    WHERE user_id = ${user.id} 
    AND status = 'active' 
    AND is_lifetime = false 
    AND expiry_date < NOW()
  `
  const expiredKeys = expiredKeysResult[0]?.count || 0

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back, {user.username}</p>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Chips Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 group">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <Coins className="absolute -top-4 -right-4 h-24 w-24 rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Total Chips</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-emerald-500">¢{formatNumber(user.balance || 0)}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Available for key generation</p>
          </CardContent>
        </Card>

        {/* Active Keys Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 group">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <Key className="absolute -top-4 -right-4 h-24 w-24 rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Active Keys</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
              <Key className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{totalKeys}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Currently active licenses</p>
          </CardContent>
        </Card>

        {/* Expired Keys Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 group">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <Activity className="absolute -top-4 -right-4 h-24 w-24 rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Expired Keys</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/25">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{expiredKeys}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>

        {/* Account Role Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 group">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <Shield className="absolute -top-4 -right-4 h-24 w-24 rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Account Role</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 transition-all duration-300 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/25">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold capitalize">{user.role}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Your access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Information Card */}
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
          <Sparkles className="absolute top-10 right-10 h-32 w-32 rotate-12" />
          <CreditCard className="absolute bottom-10 left-10 h-28 w-28 -rotate-12" />
        </div>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50">
            <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <div className="p-1 rounded bg-muted">
                <Key className="h-3 w-3" />
              </div>
              User ID:
            </span>
            <span className="font-mono text-xs md:text-sm break-all">{user.uid}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50">
            <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <div className="p-1 rounded bg-muted">
                <Activity className="h-3 w-3" />
              </div>
              Email:
            </span>
            <span className="text-xs md:text-sm break-all">{user.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 rounded-lg bg-muted/30 border border-border/50 transition-all duration-200 hover:bg-muted/50">
            <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <div className="p-1 rounded bg-muted">
                <Users className="h-3 w-3" />
              </div>
              Username:
            </span>
            <span className="text-xs md:text-sm">{user.username}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

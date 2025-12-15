import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Send, Gift, Sparkles, CreditCard, Coins, Zap } from "lucide-react"

function isChristmasSeason(): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const jan1 = new Date(year + 1, 0, 1)
  const dec1 = new Date(year, 11, 1)
  return now >= dec1 && now < jan1
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export default function BuyChipsPage() {
  const showChristmas = isChristmasSeason()

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Buy Chips</h1>
        <p className="text-muted-foreground">Purchase chips to generate more license keys</p>
      </div>

      {showChristmas && (
        <Card className="border-red-500/50 bg-gradient-to-r from-red-500/10 via-green-500/10 to-red-500/10 christmas-card overflow-hidden relative">
          {/* Background icons */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
            <Gift className="absolute top-2 right-4 h-20 w-20 rotate-12" />
            <Sparkles className="absolute bottom-2 left-4 h-16 w-16 -rotate-12" />
          </div>
          <CardHeader className="relative">
            <div className="absolute top-2 right-2 text-2xl animate-bounce">🎄</div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Gift className="h-5 w-5 text-red-400" />
              </div>
              <CardTitle className="text-red-400">Christmas Special Sale!</CardTitle>
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <CardDescription className="text-foreground/80">
              Get <span className="font-bold text-green-400">20% OFF</span> on all chip packages! Use code{" "}
              <code className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">XMAS2025</code> when
              contacting us.
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1">Offer ends January 1st, 2026</p>
          </CardHeader>
        </Card>
      )}

      {/* Safety Notice with modern style */}
      <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <Shield className="absolute top-2 right-4 h-24 w-24 rotate-12" />
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 shadow-lg shadow-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Safe & Secure Transactions</CardTitle>
          </div>
          <CardDescription>
            All transactions are processed securely. Contact us directly through Discord or Telegram for manual
            verification and instant chips top-up.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chips Packages with modern style */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${showChristmas ? "christmas-card" : ""}`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Coins className="absolute top-4 right-4 h-20 w-20 rotate-12" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-muted/80 group-hover:bg-primary/20 transition-colors">
                <Coins className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle>Starter</CardTitle>
            </div>
            <div className="text-3xl font-bold">100</div>
            <CardDescription>Chips</CardDescription>
            <div className="mt-2 space-y-1">
              {showChristmas ? (
                <>
                  <p className="text-lg font-semibold text-red-400 line-through">₱10 PHP</p>
                  <p className="text-lg font-semibold text-green-400">₱8 PHP</p>
                  <p className="text-sm text-muted-foreground">≈ $0.16 USD</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-primary">₱10 PHP</p>
                  <p className="text-sm text-muted-foreground">≈ $0.20 USD</p>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Generate up to 100 1-day keys</li>
              <li>Or 10 devices keys</li>
              <li>Basic support</li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-primary ${showChristmas ? "christmas-card border-green-500" : ""}`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Zap className="absolute top-4 right-4 h-20 w-20 rotate-12" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/20 shadow-lg shadow-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="flex items-center gap-2">
                Popular
                <span
                  className={`rounded-full px-2 py-1 text-xs text-primary-foreground ${showChristmas ? "bg-gradient-to-r from-red-500 to-green-500" : "bg-primary"}`}
                >
                  {showChristmas ? "Xmas Deal" : "Best Value"}
                </span>
              </CardTitle>
            </div>
            <div className="text-3xl font-bold">500</div>
            <CardDescription>Chips</CardDescription>
            <div className="mt-2 space-y-1">
              {showChristmas ? (
                <>
                  <p className="text-lg font-semibold text-red-400 line-through">₱50 PHP</p>
                  <p className="text-lg font-semibold text-green-400">₱40 PHP</p>
                  <p className="text-sm text-muted-foreground">≈ $0.80 USD</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-primary">₱50 PHP</p>
                  <p className="text-sm text-muted-foreground">≈ $1.00 USD</p>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Generate up to 500 1-day keys</li>
              <li>Or 50 devices keys</li>
              <li>Priority support</li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${showChristmas ? "christmas-card" : ""}`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <CreditCard className="absolute top-4 right-4 h-20 w-20 rotate-12" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-muted/80 group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle>Enterprise</CardTitle>
            </div>
            <div className="text-3xl font-bold">1000+</div>
            <CardDescription>Chips</CardDescription>
            <div className="mt-2 space-y-1">
              {showChristmas ? (
                <>
                  <p className="text-lg font-semibold text-red-400 line-through">₱100+ PHP</p>
                  <p className="text-lg font-semibold text-green-400">₱80+ PHP</p>
                  <p className="text-sm text-muted-foreground">≈ $1.60+ USD</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-primary">₱100+ PHP</p>
                  <p className="text-sm text-muted-foreground">≈ $2.00+ USD</p>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Custom chips amounts</li>
              <li>Bulk discounts</li>
              <li>Premium support</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Info with modern style */}
      <Card className={`bg-muted/30 relative overflow-hidden ${showChristmas ? "christmas-card" : ""}`}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <Coins className="absolute top-4 right-8 h-16 w-16 rotate-12" />
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/80">
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base flex items-center gap-2">
              Pricing Guide
              {showChristmas && <span className="text-xs text-green-400">(20% OFF with XMAS2025)</span>}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">100 chips</span>
              <span className="text-muted-foreground">=</span>
              <span className={`font-semibold ${showChristmas ? "text-green-400" : "text-primary"}`}>
                {showChristmas ? "₱8 PHP" : "₱10 PHP"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">500 chips</span>
              <span className="text-muted-foreground">=</span>
              <span className={`font-semibold ${showChristmas ? "text-green-400" : "text-primary"}`}>
                {showChristmas ? "₱40 PHP / $0.80 USD" : "₱50 PHP / $1 USD"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">1000 chips</span>
              <span className="text-muted-foreground">=</span>
              <span className={`font-semibold ${showChristmas ? "text-green-400" : "text-primary"}`}>
                {showChristmas ? "₱80 PHP / $1.60 USD" : "₱100 PHP / $2 USD"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Options with modern style */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <Send className="absolute top-4 right-8 h-20 w-20 rotate-12" />
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/80">
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Contact Us to Purchase</CardTitle>
              <CardDescription>Choose your preferred platform to complete the transaction</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className={`w-full justify-start transition-all duration-300 hover:scale-[1.01] ${showChristmas ? "christmas-btn bg-[#5865F2] hover:bg-[#4752C4]" : "bg-[#5865F2] hover:bg-[#4752C4]"}`}
            size="lg"
            asChild
          >
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
              <DiscordIcon className="mr-2 h-5 w-5" />
              Contact via Discord
            </a>
          </Button>
          <Button
            className={`w-full justify-start bg-transparent transition-all duration-300 hover:scale-[1.01] ${showChristmas ? "christmas-btn" : ""}`}
            size="lg"
            variant="outline"
            asChild
          >
            <a href="https://t.me" target="_blank" rel="noopener noreferrer">
              <Send className="mr-2 h-5 w-5" />
              Contact via Telegram
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

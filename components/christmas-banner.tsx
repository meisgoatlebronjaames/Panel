"use client"

import { useEffect, useState } from "react"
import { Gift, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChristmasBanner() {
  const [isChristmas, setIsChristmas] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const jan1 = new Date(year + 1, 0, 1)
    const dec1 = new Date(year, 11, 1)
    setIsChristmas(now >= dec1 && now < jan1)

    const wasDismissed = sessionStorage.getItem("christmas-banner-dismissed")
    if (wasDismissed) setDismissed(true)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem("christmas-banner-dismissed", "true")
  }

  if (!isChristmas || dismissed) return null

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-green-600 text-white py-2 px-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-10 text-white/20 text-2xl animate-pulse">❄</div>
        <div
          className="absolute bottom-0 left-1/4 text-white/20 text-xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        >
          ✦
        </div>
        <div className="absolute top-1 right-1/3 text-white/20 text-lg animate-pulse" style={{ animationDelay: "1s" }}>
          ❅
        </div>
        <div
          className="absolute bottom-0 right-20 text-white/20 text-2xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        >
          ❆
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-4 relative z-10">
        <Gift className="h-4 w-4 md:h-5 md:w-5 animate-bounce" />
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
          <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Merry Christmas! Get</span>
          <span className="md:hidden">Xmas Sale!</span>
          <span className="font-bold text-yellow-300">20% OFF</span>
          <span className="hidden md:inline">on all chip packages!</span>
          <span className="hidden md:inline text-white/80">Use code:</span>
          <code className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-yellow-300 text-xs">XMAS2025</code>
        </div>
        <Gift className="h-4 w-4 md:h-5 md:w-5 animate-bounce" style={{ animationDelay: "0.2s" }} />

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 md:right-2 h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

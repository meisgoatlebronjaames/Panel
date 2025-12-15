"use client"

import { useEffect, useState } from "react"

export function ChristmasSnow() {
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const jan1 = new Date(year + 1, 0, 1)
    const dec1 = new Date(year, 11, 1)
    setIsChristmas(now >= dec1 && now < jan1)
  }, [])

  if (!isChristmas) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Snowflakes */}
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">✦</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">✦</div>
      <div className="snowflake">❄</div>
      <div className="snowflake">❅</div>
    </div>
  )
}

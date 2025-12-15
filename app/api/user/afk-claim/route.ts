import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { amount } = await request.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Cap maximum AFK claim to prevent abuse (max 30 chips per claim = 1 hour)
    const claimAmount = Math.min(amount, 30)

    // Add chips to user
    await sql`
      UPDATE users SET balance = balance + ${claimAmount} WHERE id = ${user.id}
    `

    // Log transaction
    await sql`
      INSERT INTO balance_transactions (user_id, amount, type, description)
      VALUES (${user.id}, ${claimAmount}, 'afk_reward', ${`AFK reward: ${claimAmount} chips`})
    `

    return NextResponse.json({
      success: true,
      claimed: claimAmount,
    })
  } catch (error) {
    console.error("[v0] AFK claim error:", error)
    return NextResponse.json({ error: "Failed to claim chips" }, { status: 500 })
  }
}

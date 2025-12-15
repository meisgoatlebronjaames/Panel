import { NextResponse } from "next/server"
import { getCurrentUser, isOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const owner = await getCurrentUser()

    if (!owner || !isOwner(owner)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, amount, message } = await request.json()

    if (!userId || !amount || amount < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await sql`
      SELECT id, username, balance FROM users WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Add balance
    await sql`
      UPDATE users
      SET balance = balance + ${amount}
      WHERE id = ${userId}
    `

    // Log transaction
    const note = message ? `Gift from owner: ${message}` : "Gift from owner"
    await sql`
      INSERT INTO balance_transactions (user_id, amount, transaction_type, note, created_by_user_id)
      VALUES (${userId}, ${amount}, 'gift', ${note}, ${owner.id})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Gift balance error:", error)
    return NextResponse.json({ error: "Failed to gift balance" }, { status: 500 })
  }
}

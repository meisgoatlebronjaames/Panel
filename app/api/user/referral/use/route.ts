import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

const REFERRAL_BONUS = 50

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    // Check if user already used a referral
    const currentUser = await sql`
      SELECT referred_by FROM users WHERE id = ${user.id}
    `

    if (currentUser[0]?.referred_by) {
      return NextResponse.json({ error: "You've already used a referral code" }, { status: 400 })
    }

    // Find the referrer by code
    const referrer = await sql`
      SELECT id, referral_code FROM users WHERE referral_code = ${code.toUpperCase()}
    `

    if (referrer.length === 0) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    if (referrer[0].id === user.id) {
      return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 })
    }

    // Give bonus to both users
    await sql`
      UPDATE users SET balance = balance + ${REFERRAL_BONUS}, referred_by = ${referrer[0].id} WHERE id = ${user.id}
    `

    await sql`
      UPDATE users SET balance = balance + ${REFERRAL_BONUS} WHERE id = ${referrer[0].id}
    `

    // Log transactions
    await sql`
      INSERT INTO balance_transactions (user_id, amount, type, description)
      VALUES (${user.id}, ${REFERRAL_BONUS}, 'referral_bonus', 'Referral bonus for using code')
    `

    await sql`
      INSERT INTO balance_transactions (user_id, amount, type, description)
      VALUES (${referrer[0].id}, ${REFERRAL_BONUS}, 'referral_bonus', 'Referral bonus for new user signup')
    `

    return NextResponse.json({
      success: true,
      bonus: REFERRAL_BONUS,
    })
  } catch (error) {
    console.error("[v0] Referral use error:", error)
    return NextResponse.json({ error: "Failed to apply referral code" }, { status: 500 })
  }
}

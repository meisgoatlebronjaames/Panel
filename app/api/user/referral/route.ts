import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user's referral code
    const userResult = await sql`
      SELECT referral_code, referred_by FROM users WHERE id = ${user.id}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Count successful referrals
    const referralCount = await sql`
      SELECT COUNT(*) as count FROM users WHERE referred_by = ${user.id}
    `

    return NextResponse.json({
      referralCode: userResult[0].referral_code,
      referralCount: Number.parseInt(referralCount[0].count),
      hasUsedReferral: !!userResult[0].referred_by,
    })
  } catch (error) {
    console.error("[v0] Referral fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 })
  }
}

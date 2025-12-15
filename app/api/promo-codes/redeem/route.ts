import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    // Find the promo code
    const promoResult = await sql`
      SELECT * FROM promo_codes 
      WHERE UPPER(code) = ${normalizedCode} 
      AND is_active = true
    `

    if (promoResult.length === 0) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 400 })
    }

    const promo = promoResult[0]

    // Check if expired
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 })
    }

    // Check if max uses reached
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: "This promo code has reached its maximum uses" }, { status: 400 })
    }

    // Check if user already redeemed this code
    const redemptionCheck = await sql`
      SELECT * FROM code_redemptions 
      WHERE user_id = ${user.id} AND promo_code_id = ${promo.id}
    `

    if (redemptionCheck.length > 0) {
      return NextResponse.json({ error: "You have already redeemed this promo code" }, { status: 400 })
    }

    // Redeem the code - add chips to user
    const chipsReward = promo.bonus_chips || 0
    if (chipsReward > 0) {
      await sql`
        UPDATE users SET balance = balance + ${chipsReward} WHERE id = ${user.id}
      `

      // Log the transaction
      await sql`
        INSERT INTO balance_transactions (user_id, amount, transaction_type, note)
        VALUES (${user.id}, ${chipsReward}, 'promo_code', ${`Redeemed promo code: ${promo.code}`})
      `
    }

    // Record the redemption in code_redemptions table
    await sql`
      INSERT INTO code_redemptions (user_id, promo_code_id, chips_awarded)
      VALUES (${user.id}, ${promo.id}, ${chipsReward})
    `

    // Increment usage count
    await sql`
      UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ${promo.id}
    `

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed! You received ¢${chipsReward} chips.`,
      bonus_chips: chipsReward,
      discount_percent: promo.discount_percent,
    })
  } catch (error) {
    console.error("Error redeeming promo code:", error)
    return NextResponse.json({ error: "Failed to redeem promo code" }, { status: 500 })
  }
}

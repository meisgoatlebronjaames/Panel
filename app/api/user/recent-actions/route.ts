import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get recent balance transactions for the user
    const transactions = await sql`
      SELECT 
        bt.id,
        bt.amount,
        bt.transaction_type,
        bt.note,
        bt.created_at
      FROM balance_transactions bt
      WHERE bt.user_id = ${user.id}
      ORDER BY bt.created_at DESC
      LIMIT 20
    `

    // Get recent license key generations with details
    const recentKeys = await sql`
      SELECT 
        lk.id,
        lk.license_key,
        lk.max_devices,
        lk.is_lifetime,
        lk.expiry_date,
        lk.created_at
      FROM license_keys lk
      WHERE lk.user_id = ${user.id}
      ORDER BY lk.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      transactions,
      recentKeys,
    })
  } catch (error) {
    console.error("Error fetching recent actions:", error)
    return NextResponse.json({ error: "Failed to fetch recent actions" }, { status: 500 })
  }
}

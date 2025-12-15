import { NextResponse } from "next/server"
import { getCurrentUser, isAdminOrOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !isAdminOrOwner(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await sql`
      SELECT 
        u.id, 
        u.uid, 
        u.email, 
        u.username, 
        u.role, 
        u.balance,
        u.is_timed_out,
        u.timeout_until,
        u.created_at,
        COUNT(DISTINCT lk.id) as total_keys
      FROM users u
      LEFT JOIN license_keys lk ON u.id = lk.user_id
      GROUP BY u.id, u.uid, u.email, u.username, u.role, u.balance, u.is_timed_out, u.timeout_until, u.created_at
      ORDER BY u.created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 })
  }
}

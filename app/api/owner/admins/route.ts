import { NextResponse } from "next/server"
import { getCurrentUser, isOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !isOwner(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all admins
    const admins = await sql`
      SELECT 
        id, 
        uid, 
        email, 
        username, 
        role,
        balance,
        created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `

    return NextResponse.json({ admins })
  } catch (error) {
    console.error("[v0] Get admins error:", error)
    return NextResponse.json({ error: "Failed to get admins" }, { status: 500 })
  }
}

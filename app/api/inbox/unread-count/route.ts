import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE recipient_id = ${user.id} 
      AND is_read = FALSE 
      AND is_deleted = FALSE
    `

    return NextResponse.json({ unreadCount: Number.parseInt(result[0].count) })
  } catch (error) {
    console.error("[v0] Get unread count error:", error)
    return NextResponse.json({ error: "Failed to get unread count" }, { status: 500 })
  }
}

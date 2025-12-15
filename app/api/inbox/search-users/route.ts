import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search users by email, username, or UID
    const users = await sql`
      SELECT id, uid, email, username, role
      FROM users
      WHERE (
        email ILIKE ${`%${query}%`} OR 
        username ILIKE ${`%${query}%`} OR 
        uid ILIKE ${`%${query}%`}
      )
      AND id != ${user.id}
      LIMIT 10
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Search users error:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}

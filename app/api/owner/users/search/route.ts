import { NextResponse } from "next/server"
import { getCurrentUser, isOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const owner = await getCurrentUser()

    if (!owner || !isOwner(owner)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const users = await sql`
      SELECT id, uid, email, username, role, balance
      FROM users
      WHERE (email ILIKE ${`%${query}%`} OR username ILIKE ${`%${query}%`} OR uid ILIKE ${`%${query}%`})
      LIMIT 10
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Search users error:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}

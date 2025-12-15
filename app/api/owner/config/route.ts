import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

// GET - List all owners
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const owners = await sql`
      SELECT id, uid, email, username, role, balance, created_at
      FROM users
      WHERE role = 'owner'
      ORDER BY created_at DESC
    `

    return NextResponse.json({ owners })
  } catch (error) {
    console.error("[v0] Failed to fetch owners:", error)
    return NextResponse.json({ error: "Failed to fetch owners" }, { status: 500 })
  }
}

// POST - Add new owner
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const targetUser = await sql`
      SELECT id, role FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser[0].role === "owner") {
      return NextResponse.json({ error: "User is already an owner" }, { status: 400 })
    }

    // Promote to owner
    await sql`
      UPDATE users SET role = 'owner' WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to add owner:", error)
    return NextResponse.json({ error: "Failed to add owner" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getCurrentUser, isOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const owner = await getCurrentUser()

    if (!owner || !isOwner(owner)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await sql`
      SELECT id, role FROM users WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    if (user.role === "owner") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 })
    }

    if (user.role === "admin") {
      return NextResponse.json({ error: "User is already an admin" }, { status: 400 })
    }

    // Promote to admin
    await sql`
      UPDATE users
      SET role = 'admin'
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Add admin error:", error)
    return NextResponse.json({ error: "Failed to add admin" }, { status: 500 })
  }
}

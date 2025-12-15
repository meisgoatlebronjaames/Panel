import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = Number.parseInt(id)

    // Prevent removing yourself
    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot remove yourself as owner" }, { status: 400 })
    }

    // Check if target user exists and is an owner
    const targetUser = await sql`
      SELECT id, role FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser[0].role !== "owner") {
      return NextResponse.json({ error: "User is not an owner" }, { status: 400 })
    }

    // Demote to regular user
    await sql`
      UPDATE users SET role = 'user' WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to remove owner:", error)
    return NextResponse.json({ error: "Failed to remove owner" }, { status: 500 })
  }
}

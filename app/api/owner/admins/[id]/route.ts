import { NextResponse } from "next/server"
import { getCurrentUser, isOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const owner = await getCurrentUser()

    if (!owner || !isOwner(owner)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    // Check if user exists and is admin
    const userResult = await sql`
      SELECT id, role FROM users WHERE id = ${id}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    if (user.role !== "admin") {
      return NextResponse.json({ error: "User is not an admin" }, { status: 400 })
    }

    // Demote to regular user
    await sql`
      UPDATE users
      SET role = 'user'
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Remove admin error:", error)
    return NextResponse.json({ error: "Failed to remove admin" }, { status: 500 })
  }
}

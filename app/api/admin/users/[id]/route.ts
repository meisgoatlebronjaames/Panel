import { NextResponse } from "next/server"
import { getCurrentUser, isAdminOrOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentUser()

    if (!admin || !isAdminOrOwner(admin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    // Check if user is admin or owner
    const targetUser = await sql`
      SELECT role FROM users WHERE id = ${id}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser[0].role === "admin" || targetUser[0].role === "owner") {
      return NextResponse.json({ error: "Cannot delete admins or owners" }, { status: 403 })
    }

    // Delete user (cascade will delete keys and transactions)
    await sql`
      DELETE FROM users WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

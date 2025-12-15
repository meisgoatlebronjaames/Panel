import { NextResponse } from "next/server"
import { getCurrentUser, isAdminOrOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentUser()

    if (!admin || !isAdminOrOwner(admin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const { hours } = await request.json()

    if (!hours || hours < 1) {
      return NextResponse.json({ error: "Invalid timeout duration" }, { status: 400 })
    }

    // Calculate timeout end
    const timeoutUntil = new Date()
    timeoutUntil.setHours(timeoutUntil.getHours() + hours)

    // Check if user is admin or owner
    const targetUser = await sql`
      SELECT role FROM users WHERE id = ${id}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser[0].role === "admin" || targetUser[0].role === "owner") {
      return NextResponse.json({ error: "Cannot timeout admins or owners" }, { status: 403 })
    }

    // Set timeout
    await sql`
      UPDATE users
      SET is_timed_out = true, timeout_until = ${timeoutUntil}, timeout_by_admin_id = ${admin.id}
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Timeout user error:", error)
    return NextResponse.json({ error: "Failed to timeout user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentUser()

    if (!admin || !isAdminOrOwner(admin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    // Remove timeout
    await sql`
      UPDATE users
      SET is_timed_out = false, timeout_until = NULL, timeout_by_admin_id = NULL
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Remove timeout error:", error)
    return NextResponse.json({ error: "Failed to remove timeout" }, { status: 500 })
  }
}

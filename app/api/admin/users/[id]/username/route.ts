import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser()

    // Only owners can change other users' usernames
    if (!currentUser || currentUser.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized - Owner access required" }, { status: 403 })
    }

    const { id } = await params
    const { username } = await request.json()

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (username.trim().length > 30) {
      return NextResponse.json({ error: "Username must be less than 30 characters" }, { status: 400 })
    }

    // Check if username is already taken
    const existingUser = await sql`
      SELECT id FROM users WHERE LOWER(username) = LOWER(${username.trim()}) AND id != ${id}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
    }

    // Update the username
    await sql`
      UPDATE users SET username = ${username.trim()} WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update username error:", error)
    return NextResponse.json({ error: "Failed to update username" }, { status: 500 })
  }
}

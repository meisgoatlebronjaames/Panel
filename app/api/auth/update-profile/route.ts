import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email } = await request.json()

    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 })
    }

    // Get user from session
    const users = await sql`
      SELECT id, email FROM users WHERE uid = ${sessionToken}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = users[0].id
    const currentEmail = users[0].email

    // Check if new email is already taken by another user
    if (email !== currentEmail) {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${userId}
      `
      if (existingUser.length > 0) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 })
      }
    }

    // Update user profile
    await sql`
      UPDATE users 
      SET username = ${username}, email = ${email}, updated_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

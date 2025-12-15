import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { sendPasswordVerificationEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword } = await request.json()

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 })
    }

    // Verify current password
    const users = await sql`
      SELECT password_hash, email, username FROM users WHERE id = ${user.id}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Generate verification code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate any existing codes for this user
    await sql`
      UPDATE password_verification_codes 
      SET used = true 
      WHERE user_id = ${user.id} AND used = false
    `

    // Save the new code
    await sql`
      INSERT INTO password_verification_codes (user_id, code, expires_at)
      VALUES (${user.id}, ${code}, ${expiresAt.toISOString()})
    `

    // Send email
    const emailSent = await sendPasswordVerificationEmail(users[0].email, users[0].username, code)

    if (!emailSent) {
      return NextResponse.json(
        {
          error: "Failed to send verification email. Please try again.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    })
  } catch (error) {
    console.error("Error requesting code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

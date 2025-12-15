import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, newPassword } = await request.json()

    if (!code || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Verify the code
    const codes = await sql`
      SELECT id, expires_at FROM password_verification_codes 
      WHERE user_id = ${user.id} 
        AND code = ${code} 
        AND used = false 
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (codes.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Mark the code as used
    await sql`
      UPDATE password_verification_codes 
      SET used = true 
      WHERE id = ${codes[0].id}
    `

    // Hash new password and update
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    await sql`
      UPDATE users 
      SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

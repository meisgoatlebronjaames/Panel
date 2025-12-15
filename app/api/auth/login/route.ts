import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const result = await sql`
      SELECT id, uid, email, username, role, balance, password_hash, is_timed_out, timeout_until
      FROM users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = result[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is timed out
    if (user.is_timed_out && user.timeout_until) {
      const timeoutDate = new Date(user.timeout_until)
      if (timeoutDate > new Date()) {
        return NextResponse.json(
          {
            error: "Account is timed out",
            timeout_until: user.timeout_until,
          },
          { status: 403 },
        )
      }
    }

    // Create session
    await createSession(user.uid)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

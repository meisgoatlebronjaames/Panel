import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateUID, hashPassword, createSession } from "@/lib/auth"

const REGISTRATION_BONUS_CHIPS = 100

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user with bonus chips
    const uid = generateUID()
    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (uid, email, password_hash, username, role, balance)
      VALUES (${uid}, ${email}, ${passwordHash}, ${username}, 'user', ${REGISTRATION_BONUS_CHIPS})
      RETURNING id, uid, email, username, role, balance
    `

    const user = result[0]

    // Create session
    await createSession(uid)

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
      bonusChips: REGISTRATION_BONUS_CHIPS,
      message: `Welcome! You received ${REGISTRATION_BONUS_CHIPS} bonus chips!`,
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

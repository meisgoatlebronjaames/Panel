import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const uid = searchParams.get("uid")

    if (!email && !uid) {
      return NextResponse.json({ error: "Email or UID is required" }, { status: 400 })
    }

    let foundUser

    if (email && uid) {
      // Search by both email and uid
      foundUser = await sql`
        SELECT id, uid, email, username, role, balance, created_at
        FROM users
        WHERE email = ${email} AND uid = ${uid}
      `
    } else if (email) {
      // Search by email
      foundUser = await sql`
        SELECT id, uid, email, username, role, balance, created_at
        FROM users
        WHERE email = ${email}
      `
    } else {
      // Search by uid
      foundUser = await sql`
        SELECT id, uid, email, username, role, balance, created_at
        FROM users
        WHERE uid = ${uid}
      `
    }

    if (foundUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: foundUser[0] })
  } catch (error) {
    console.error("[v0] Failed to search user:", error)
    return NextResponse.json({ error: "Failed to search user" }, { status: 500 })
  }
}

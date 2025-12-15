import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Unlink Discord from user account
    const result = await sql`
      UPDATE users 
      SET 
        discord_id = NULL,
        discord_username = NULL
      WHERE uid = ${sessionId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Discord unlink error:", error)
    return NextResponse.json({ error: "Failed to unlink Discord" }, { status: 500 })
  }
}

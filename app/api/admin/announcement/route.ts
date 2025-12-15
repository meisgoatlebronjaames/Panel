import { NextResponse } from "next/server"
import { getCurrentUser, isAdmin, isOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || (!isAdmin(user) && !isOwner(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { subject, body } = await request.json()

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
    }

    // Get all users
    const allUsers = await sql`SELECT id FROM users`

    // Send announcement to all users
    for (const recipient of allUsers) {
      await sql`
        INSERT INTO messages (sender_id, recipient_id, subject, body, message_type)
        VALUES (${user.id}, ${recipient.id}, ${subject}, ${body}, 'announcement')
      `
    }

    return NextResponse.json({
      success: true,
      message: `Announcement sent to ${allUsers.length} users`,
    })
  } catch (error) {
    console.error("[v0] Send announcement error:", error)
    return NextResponse.json({ error: "Failed to send announcement" }, { status: 500 })
  }
}

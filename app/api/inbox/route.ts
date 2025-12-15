import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

// Get messages for current user
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "inbox"
    const search = searchParams.get("search") || ""

    let messages

    if (filter === "sent") {
      messages = await sql`
        SELECT 
          m.*,
          s.username as sender_username,
          s.email as sender_email,
          r.username as recipient_username,
          r.email as recipient_email
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.recipient_id = r.id
        WHERE m.sender_id = ${user.id}
        AND m.is_deleted = FALSE
        AND (
          ${search} = '' OR
          m.subject ILIKE ${`%${search}%`} OR
          m.body ILIKE ${`%${search}%`} OR
          r.username ILIKE ${`%${search}%`} OR
          r.email ILIKE ${`%${search}%`}
        )
        ORDER BY m.created_at DESC
        LIMIT 100
      `
    } else if (filter === "starred") {
      messages = await sql`
        SELECT 
          m.*,
          s.username as sender_username,
          s.email as sender_email,
          r.username as recipient_username,
          r.email as recipient_email
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.recipient_id = r.id
        WHERE m.recipient_id = ${user.id}
        AND m.is_starred = TRUE
        AND m.is_deleted = FALSE
        AND (
          ${search} = '' OR
          m.subject ILIKE ${`%${search}%`} OR
          m.body ILIKE ${`%${search}%`} OR
          s.username ILIKE ${`%${search}%`} OR
          s.email ILIKE ${`%${search}%`}
        )
        ORDER BY m.created_at DESC
        LIMIT 100
      `
    } else {
      // Default inbox
      messages = await sql`
        SELECT 
          m.*,
          s.username as sender_username,
          s.email as sender_email,
          r.username as recipient_username,
          r.email as recipient_email
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.recipient_id = r.id
        WHERE m.recipient_id = ${user.id}
        AND m.is_deleted = FALSE
        AND (
          ${search} = '' OR
          m.subject ILIKE ${`%${search}%`} OR
          m.body ILIKE ${`%${search}%`} OR
          s.username ILIKE ${`%${search}%`} OR
          s.email ILIKE ${`%${search}%`}
        )
        ORDER BY m.created_at DESC
        LIMIT 100
      `
    }

    // Get unread count
    const unreadCount = await sql`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE recipient_id = ${user.id} 
      AND is_read = FALSE 
      AND is_deleted = FALSE
    `

    return NextResponse.json({
      messages,
      unreadCount: Number.parseInt(unreadCount[0].count),
    })
  } catch (error) {
    console.error("[v0] Get messages error:", error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}

// Send a message
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientId, subject, body, messageType = "personal" } = await request.json()

    if (!recipientId || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify recipient exists
    const recipient = await sql`SELECT id FROM users WHERE id = ${recipientId}`
    if (recipient.length === 0) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    const message = await sql`
      INSERT INTO messages (sender_id, recipient_id, subject, body, message_type)
      VALUES (${user.id}, ${recipientId}, ${subject}, ${body}, ${messageType})
      RETURNING *
    `

    return NextResponse.json({ message: message[0] })
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

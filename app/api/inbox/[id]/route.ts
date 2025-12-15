import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

// Mark message as read, star, or delete
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const messageId = Number.parseInt(id)
    const { action } = await request.json()

    // Verify message belongs to user
    const message = await sql`
      SELECT * FROM messages 
      WHERE id = ${messageId} 
      AND (recipient_id = ${user.id} OR sender_id = ${user.id})
    `

    if (message.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (action === "read") {
      await sql`UPDATE messages SET is_read = TRUE WHERE id = ${messageId}`
    } else if (action === "unread") {
      await sql`UPDATE messages SET is_read = FALSE WHERE id = ${messageId}`
    } else if (action === "star") {
      await sql`UPDATE messages SET is_starred = TRUE WHERE id = ${messageId}`
    } else if (action === "unstar") {
      await sql`UPDATE messages SET is_starred = FALSE WHERE id = ${messageId}`
    } else if (action === "delete") {
      await sql`UPDATE messages SET is_deleted = TRUE WHERE id = ${messageId}`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update message error:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}

// Permanently delete message
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const messageId = Number.parseInt(id)

    await sql`
      DELETE FROM messages 
      WHERE id = ${messageId} 
      AND (recipient_id = ${user.id} OR sender_id = ${user.id})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete message error:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

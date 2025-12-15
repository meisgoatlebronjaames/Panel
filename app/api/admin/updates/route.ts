import { NextResponse } from "next/server"
import { getCurrentUser, isAdminOrOwner } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !isAdminOrOwner(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all updates
    const updates = await sql`
      SELECT 
        au.id, 
        au.version, 
        au.update_message, 
        au.is_forced,
        au.created_at,
        u.username as created_by
      FROM app_updates au
      JOIN users u ON au.created_by_user_id = u.id
      ORDER BY au.created_at DESC
    `

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("[v0] Get updates error:", error)
    return NextResponse.json({ error: "Failed to get updates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !isAdminOrOwner(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { version, updateMessage } = await request.json()

    if (!version || !updateMessage) {
      return NextResponse.json({ error: "Version and update message are required" }, { status: 400 })
    }

    // Create update notification
    await sql`
      INSERT INTO app_updates (version, update_message, is_forced, created_by_user_id)
      VALUES (${version}, ${updateMessage}, true, ${user.id})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Create update error:", error)
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 })
  }
}

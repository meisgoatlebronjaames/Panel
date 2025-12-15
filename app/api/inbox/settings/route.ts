import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await sql`
      SELECT * FROM inbox_settings WHERE user_id = ${user.id}
    `

    if (settings.length === 0) {
      // Create default settings
      const newSettings = await sql`
        INSERT INTO inbox_settings (user_id)
        VALUES (${user.id})
        RETURNING *
      `
      return NextResponse.json({ settings: newSettings[0] })
    }

    return NextResponse.json({ settings: settings[0] })
  } catch (error) {
    console.error("[v0] Get inbox settings error:", error)
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationsEnabled, emailNotifications } = await request.json()

    const settings = await sql`
      INSERT INTO inbox_settings (user_id, notifications_enabled, email_notifications)
      VALUES (${user.id}, ${notificationsEnabled}, ${emailNotifications})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        notifications_enabled = ${notificationsEnabled},
        email_notifications = ${emailNotifications},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({ settings: settings[0] })
  } catch (error) {
    console.error("[v0] Update inbox settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

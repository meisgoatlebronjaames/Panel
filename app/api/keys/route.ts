import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get all keys for the user
    const keys = await sql`
      SELECT id, license_key, expiry_date, is_lifetime, max_devices, devices_used, status, created_at, updated_at
      FROM license_keys
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("[v0] Get keys error:", error)
    return NextResponse.json({ error: "Failed to get keys" }, { status: 500 })
  }
}

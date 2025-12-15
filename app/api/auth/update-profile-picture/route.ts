import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profilePicture } = await request.json()

    if (!profilePicture) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Update profile picture in database (storing base64)
    await sql`
      UPDATE users 
      SET profile_picture = ${profilePicture}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile picture:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

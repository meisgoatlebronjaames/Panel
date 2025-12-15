import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await sql`DELETE FROM promo_code_redemptions WHERE promo_code_id = ${id}`
    await sql`DELETE FROM promo_codes WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo code:", error)
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { is_active } = await request.json()

    await sql`UPDATE promo_codes SET is_active = ${is_active} WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating promo code:", error)
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 })
  }
}

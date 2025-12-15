import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const codes = await sql`
      SELECT pc.*, u.username as created_by_username
      FROM promo_codes pc
      LEFT JOIN users u ON pc.created_by = u.id
      ORDER BY pc.created_at DESC
    `

    return NextResponse.json({ codes })
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, bonus_chips, discount_percent, max_uses, expires_at } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    // Check if code already exists
    const existing = await sql`SELECT * FROM promo_codes WHERE UPPER(code) = ${normalizedCode}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO promo_codes (code, bonus_chips, discount_percent, max_uses, expires_at, created_by)
      VALUES (${normalizedCode}, ${bonus_chips || 0}, ${discount_percent || 0}, ${max_uses || null}, ${expires_at || null}, ${user.id})
      RETURNING *
    `

    return NextResponse.json({ success: true, promo_code: result[0] })
  } catch (error) {
    console.error("Error creating promo code:", error)
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 })
  }
}

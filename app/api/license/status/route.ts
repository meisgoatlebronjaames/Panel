import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// API endpoint to check license status and get details
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const licenseKey = url.searchParams.get("key")

    if (!licenseKey) {
      return NextResponse.json({ error: "License key is required" }, { status: 400 })
    }

    const licenses = await sql`
      SELECT 
        lk.license_key,
        lk.expiry_date,
        lk.is_lifetime,
        lk.max_devices,
        lk.devices_used,
        lk.status,
        lk.created_at,
        u.username as owner
      FROM license_keys lk
      JOIN users u ON lk.user_id = u.id
      WHERE lk.license_key = ${licenseKey}
    `

    if (licenses.length === 0) {
      return NextResponse.json({ error: "License not found" }, { status: 404 })
    }

    const license = licenses[0]

    // Calculate days remaining
    let daysRemaining = null
    let isExpired = false

    if (!license.is_lifetime && license.expiry_date) {
      const expiryDate = new Date(license.expiry_date)
      const now = new Date()
      const diffTime = expiryDate.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      isExpired = daysRemaining < 0
    }

    return NextResponse.json({
      license: {
        key: license.license_key,
        owner: license.owner,
        status: isExpired ? "expired" : license.status,
        isLifetime: license.is_lifetime,
        expiresAt: license.expiry_date,
        daysRemaining: license.is_lifetime ? null : daysRemaining,
        maxDevices: license.max_devices,
        devicesUsed: license.devices_used,
        createdAt: license.created_at,
      },
    })
  } catch (error) {
    console.error("Error getting license status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

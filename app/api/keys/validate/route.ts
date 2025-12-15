import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { licenseKey, deviceId } = await request.json()

    if (!licenseKey || !deviceId) {
      return NextResponse.json({ error: "License key and device ID are required" }, { status: 400 })
    }

    // Find license key
    const keyResult = await sql`
      SELECT id, user_id, expiry_date, is_lifetime, max_devices, devices_used, status
      FROM license_keys
      WHERE license_key = ${licenseKey}
    `

    if (keyResult.length === 0) {
      return NextResponse.json({ error: "Invalid license key", valid: false }, { status: 404 })
    }

    const key = keyResult[0]

    // Check if key is active
    if (key.status !== "active") {
      return NextResponse.json({ error: "License key is not active", valid: false }, { status: 403 })
    }

    // Check expiry
    if (!key.is_lifetime && key.expiry_date) {
      const expiryDate = new Date(key.expiry_date)
      if (expiryDate < new Date()) {
        // Mark as expired
        await sql`
          UPDATE license_keys
          SET status = 'expired'
          WHERE id = ${key.id}
        `
        return NextResponse.json({ error: "License key has expired", valid: false }, { status: 403 })
      }
    }

    // Check if device already registered
    const deviceResult = await sql`
      SELECT id FROM devices
      WHERE license_key_id = ${key.id} AND device_id = ${deviceId}
    `

    if (deviceResult.length > 0) {
      // Update last used
      await sql`
        UPDATE devices
        SET last_used_at = NOW()
        WHERE license_key_id = ${key.id} AND device_id = ${deviceId}
      `

      return NextResponse.json({
        valid: true,
        message: "License key is valid",
      })
    }

    // Check device limit
    if (key.devices_used >= key.max_devices) {
      return NextResponse.json({ error: "Device limit reached", valid: false }, { status: 403 })
    }

    // Register new device
    await sql`
      INSERT INTO devices (license_key_id, device_id)
      VALUES (${key.id}, ${deviceId})
    `

    // Increment devices used
    await sql`
      UPDATE license_keys
      SET devices_used = devices_used + 1
      WHERE id = ${key.id}
    `

    return NextResponse.json({
      valid: true,
      message: "License key is valid and device registered",
    })
  } catch (error) {
    console.error("[v0] License validation error:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}

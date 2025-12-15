import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// API endpoint for APK/external apps to verify license keys
export async function POST(request: Request) {
  try {
    const { licenseKey, deviceId, deviceInfo } = await request.json()

    if (!licenseKey) {
      return NextResponse.json(
        {
          valid: false,
          error: "License key is required",
        },
        { status: 400 },
      )
    }

    if (!deviceId) {
      return NextResponse.json(
        {
          valid: false,
          error: "Device ID is required",
        },
        { status: 400 },
      )
    }

    // Find the license key
    const licenses = await sql`
      SELECT 
        lk.id,
        lk.license_key,
        lk.expiry_date,
        lk.is_lifetime,
        lk.max_devices,
        lk.devices_used,
        lk.status,
        u.username,
        u.uid as user_uid
      FROM license_keys lk
      JOIN users u ON lk.user_id = u.id
      WHERE lk.license_key = ${licenseKey}
    `

    if (licenses.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid license key",
        },
        { status: 404 },
      )
    }

    const license = licenses[0]

    // Check if license is active
    if (license.status !== "active") {
      return NextResponse.json(
        {
          valid: false,
          error: "License key has been " + license.status,
        },
        { status: 403 },
      )
    }

    // Check expiry (if not lifetime)
    if (!license.is_lifetime && license.expiry_date) {
      const expiryDate = new Date(license.expiry_date)
      if (expiryDate < new Date()) {
        // Update license status to expired
        await sql`
          UPDATE license_keys SET status = 'expired' WHERE id = ${license.id}
        `
        return NextResponse.json(
          {
            valid: false,
            error: "License key has expired",
          },
          { status: 403 },
        )
      }
    }

    // Check if device is already registered
    const existingDevices = await sql`
      SELECT id FROM devices 
      WHERE license_key_id = ${license.id} AND device_id = ${deviceId}
    `

    if (existingDevices.length > 0) {
      // Device already registered, update last used
      await sql`
        UPDATE devices 
        SET last_used_at = CURRENT_TIMESTAMP, device_info = ${deviceInfo || null}
        WHERE license_key_id = ${license.id} AND device_id = ${deviceId}
      `

      return NextResponse.json({
        valid: true,
        license: {
          key: license.license_key,
          owner: license.username,
          expiresAt: license.is_lifetime ? null : license.expiry_date,
          isLifetime: license.is_lifetime,
          devicesUsed: license.devices_used,
          maxDevices: license.max_devices,
        },
      })
    }

    // New device - check if max devices reached
    if (license.devices_used >= license.max_devices) {
      return NextResponse.json(
        {
          valid: false,
          error: `Maximum devices (${license.max_devices}) reached for this license`,
        },
        { status: 403 },
      )
    }

    // Register new device
    await sql`
      INSERT INTO devices (license_key_id, device_id, device_info)
      VALUES (${license.id}, ${deviceId}, ${deviceInfo || null})
    `

    // Update devices count
    await sql`
      UPDATE license_keys 
      SET devices_used = devices_used + 1 
      WHERE id = ${license.id}
    `

    return NextResponse.json({
      valid: true,
      license: {
        key: license.license_key,
        owner: license.username,
        expiresAt: license.is_lifetime ? null : license.expiry_date,
        isLifetime: license.is_lifetime,
        devicesUsed: license.devices_used + 1,
        maxDevices: license.max_devices,
      },
    })
  } catch (error) {
    console.error("Error verifying license:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint for simple verification (just checks if valid, no device registration)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const licenseKey = url.searchParams.get("key")

    if (!licenseKey) {
      return NextResponse.json(
        {
          valid: false,
          error: "License key is required",
        },
        { status: 400 },
      )
    }

    const licenses = await sql`
      SELECT 
        lk.id,
        lk.expiry_date,
        lk.is_lifetime,
        lk.status,
        u.username
      FROM license_keys lk
      JOIN users u ON lk.user_id = u.id
      WHERE lk.license_key = ${licenseKey}
    `

    if (licenses.length === 0) {
      return NextResponse.json({ valid: false, error: "Invalid license key" }, { status: 404 })
    }

    const license = licenses[0]

    if (license.status !== "active") {
      return NextResponse.json({ valid: false, error: "License is not active" }, { status: 403 })
    }

    if (!license.is_lifetime && license.expiry_date) {
      const expiryDate = new Date(license.expiry_date)
      if (expiryDate < new Date()) {
        return NextResponse.json({ valid: false, error: "License has expired" }, { status: 403 })
      }
    }

    return NextResponse.json({
      valid: true,
      owner: license.username,
      isLifetime: license.is_lifetime,
      expiresAt: license.is_lifetime ? null : license.expiry_date,
    })
  } catch (error) {
    console.error("Error checking license:", error)
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 })
  }
}

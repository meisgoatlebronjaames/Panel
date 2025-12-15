import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { calculateExpiryDate, calculateUpgradeCost } from "@/lib/license-utils"

// Update license key
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const { expiry, maxDevices } = await request.json()

    // Get the key to verify ownership and current values
    const keyResult = await sql`
      SELECT id, user_id, is_lifetime, expiry_date, max_devices FROM license_keys WHERE id = ${id}
    `

    if (keyResult.length === 0) {
      return NextResponse.json({ error: "License key not found" }, { status: 404 })
    }

    const key = keyResult[0]

    // Verify ownership
    if (key.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const currentDays = key.is_lifetime ? -1 : calculateCurrentDays(key.expiry_date)
    const newDays = expiry === -1 ? -1 : expiry
    const currentDevices = key.max_devices
    const newDevices = maxDevices || currentDevices

    const upgradeCost = calculateUpgradeCost(currentDays, newDays, currentDevices, newDevices)

    // Check if user has enough balance for upgrade
    if (upgradeCost > 0) {
      if (user.balance < upgradeCost) {
        return NextResponse.json(
          {
            error: "Insufficient chips for upgrade",
            required: upgradeCost,
            current: user.balance,
            needed: upgradeCost - user.balance,
          },
          { status: 400 },
        )
      }

      // Deduct balance
      await sql`
        UPDATE users SET balance = balance - ${upgradeCost} WHERE id = ${user.id}
      `

      // Log transaction
      await sql`
        INSERT INTO balance_transactions (user_id, amount, type, description)
        VALUES (${user.id}, ${-upgradeCost}, 'key_upgrade', ${`Upgraded key ${key.id}: ${currentDays}d/${currentDevices}dev → ${newDays}d/${newDevices}dev`})
      `
    }

    // Update the key
    if (expiry !== undefined) {
      if (expiry === -1) {
        await sql`
          UPDATE license_keys
          SET is_lifetime = true, expiry_date = NULL, updated_at = NOW()
          WHERE id = ${id}
        `
      } else {
        const expiryDate = calculateExpiryDate(expiry)
        await sql`
          UPDATE license_keys
          SET is_lifetime = false, expiry_date = ${expiryDate}, updated_at = NOW()
          WHERE id = ${id}
        `
      }
    }

    if (maxDevices !== undefined) {
      await sql`
        UPDATE license_keys
        SET max_devices = ${maxDevices}, updated_at = NOW()
        WHERE id = ${id}
      `
    }

    // Get updated key
    const updatedKey = await sql`
      SELECT id, license_key, expiry_date, is_lifetime, max_devices, devices_used, status, created_at
      FROM license_keys
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      key: updatedKey[0],
      chipsDeducted: upgradeCost,
    })
  } catch (error) {
    console.error("[v0] Update key error:", error)
    return NextResponse.json({ error: "Failed to update key" }, { status: 500 })
  }
}

function calculateCurrentDays(expiryDate: string | null): number {
  if (!expiryDate) return 1
  const now = new Date()
  const exp = new Date(expiryDate)
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 1
  if (diffDays <= 3) return 3
  if (diffDays <= 7) return 7
  if (diffDays <= 14) return 14
  return 30
}

// Delete license key
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    const keyResult = await sql`
      SELECT id, user_id FROM license_keys WHERE id = ${id}
    `

    if (keyResult.length === 0) {
      return NextResponse.json({ error: "License key not found" }, { status: 404 })
    }

    const key = keyResult[0]

    if (key.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await sql`
      DELETE FROM license_keys WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete key error:", error)
    return NextResponse.json({ error: "Failed to delete key" }, { status: 500 })
  }
}

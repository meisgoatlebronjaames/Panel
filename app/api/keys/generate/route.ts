import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { generateLicenseKey, calculateKeyCost, calculateExpiryDate } from "@/lib/license-utils"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { days, maxDevices, customKey } = body

    if (days === undefined || days === null) {
      return NextResponse.json({ error: "Days is required" }, { status: 400 })
    }

    if (!maxDevices || typeof maxDevices !== "number" || maxDevices < 1) {
      return NextResponse.json({ error: "Max devices must be at least 1" }, { status: 400 })
    }

    const daysNum = typeof days === "number" ? days : Number.parseInt(days, 10)
    const devicesNum = typeof maxDevices === "number" ? maxDevices : Number.parseInt(maxDevices, 10)

    if (isNaN(daysNum) || (daysNum !== -1 && daysNum < 1)) {
      return NextResponse.json({ error: "Invalid days value" }, { status: 400 })
    }

    if (isNaN(devicesNum) || devicesNum < 1) {
      return NextResponse.json({ error: "Invalid max devices value" }, { status: 400 })
    }

    const cost = calculateKeyCost(daysNum, devicesNum)

    if (user.balance < cost) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: cost,
          current: user.balance,
          needed: cost - user.balance,
        },
        { status: 400 },
      )
    }

    let licenseKey: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      licenseKey = generateLicenseKey(user.username, customKey)

      const existing = await sql`
        SELECT id FROM license_keys WHERE license_key = ${licenseKey}
      `

      if (existing.length === 0) {
        isUnique = true
      } else if (customKey) {
        return NextResponse.json({ error: "This license key already exists" }, { status: 400 })
      }

      attempts++
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique key. Please try again." }, { status: 500 })
    }

    const expiryDate = calculateExpiryDate(daysNum)
    const isLifetime = daysNum === -1

    const result = await sql`
      INSERT INTO license_keys (license_key, user_id, expiry_date, is_lifetime, max_devices, devices_used, status)
      VALUES (${licenseKey!}, ${user.id}, ${expiryDate}, ${isLifetime}, ${devicesNum}, 0, 'active')
      RETURNING id, license_key, expiry_date, is_lifetime, max_devices, devices_used, status, created_at
    `

    await sql`
      UPDATE users
      SET balance = balance - ${cost}
      WHERE id = ${user.id}
    `

    const durationText = isLifetime ? "Lifetime" : `${daysNum} day${daysNum !== 1 ? "s" : ""}`
    await sql`
      INSERT INTO balance_transactions (user_id, amount, transaction_type, note)
      VALUES (${user.id}, ${-cost}, 'key_generation', ${`${durationText} key • ${devicesNum} device${devicesNum !== 1 ? "s" : ""} • ${licenseKey}`})
    `

    return NextResponse.json({
      success: true,
      key: result[0],
      balanceDeducted: cost,
    })
  } catch (error) {
    console.error("[v0] Key generation error:", error)
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 })
  }
}

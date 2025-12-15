import { nanoid } from "nanoid"

export function generateLicenseKey(username: string, customKey?: string): string {
  if (customKey) {
    // Validate custom key: only letters and numbers, 5-10 characters
    const alphanumericOnly = customKey.replace(/[^a-zA-Z0-9]/g, "")
    if (alphanumericOnly.length < 5 || alphanumericOnly.length > 10) {
      throw new Error("Custom key must be 5-10 alphanumeric characters")
    }
    return alphanumericOnly.toUpperCase()
  }

  // Default format: username-randomalphanumeric (10 chars random part)
  const randomPart = nanoid(10)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 10)
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${randomPart}`
}

// Calculate chips cost for key generation
export function calculateKeyCost(days: number, maxDevices: number): number {
  let cost = 0

  // Days cost
  if (days === 1) cost += 1
  else if (days === 3) cost += 3
  else if (days === 7) cost += 7
  else if (days === 14) cost += 14
  else if (days === 30) cost += 30
  else if (days === -1) cost += 50 // Lifetime

  // Device cost: every 10 devices = 10 chips
  cost += Math.ceil(maxDevices / 10) * 10

  return cost
}

export function calculateUpgradeCost(
  currentDays: number,
  newDays: number,
  currentDevices: number,
  newDevices: number,
): number {
  const currentCost = calculateKeyCost(currentDays, currentDevices)
  const newCost = calculateKeyCost(newDays, newDevices)

  // Only charge for the difference (upgrades only)
  return Math.max(0, newCost - currentCost)
}

// Calculate expiry date
export function calculateExpiryDate(days: number): Date | null {
  if (days === -1) return null // Lifetime

  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  return expiry
}

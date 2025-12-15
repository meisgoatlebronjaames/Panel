/**
 * Formats large numbers into a compact, human-readable format
 * Examples: 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M
 */
export function formatNumber(num: number): string {
  if (num === null || num === undefined) return "0"

  const absNum = Math.abs(num)
  const sign = num < 0 ? "-" : ""

  if (absNum >= 1_000_000_000) {
    const formatted = (absNum / 1_000_000_000).toFixed(1)
    return sign + (formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted) + "B"
  }

  if (absNum >= 1_000_000) {
    const formatted = (absNum / 1_000_000).toFixed(1)
    return sign + (formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted) + "M"
  }

  if (absNum >= 1_000) {
    const formatted = (absNum / 1_000).toFixed(1)
    return sign + (formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted) + "K"
  }

  return sign + absNum.toString()
}

/**
 * Formats chips with the ¢ symbol and compact number
 * Examples: 1000 -> ¢1K, 1500 -> ¢1.5K
 */
export function formatChips(num: number): string {
  return `¢${formatNumber(num)}`
}

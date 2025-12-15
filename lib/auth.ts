import { sql } from "./db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"

export interface User {
  id: number
  uid: string
  email: string
  username: string
  role: "user" | "admin" | "owner"
  balance: number
  is_timed_out: boolean
  timeout_until: string | null
  created_at: string
  profile_picture: string | null
  discord_id: string | null
  discord_username: string | null
}

// Generate unique UID
export function generateUID(): string {
  return `UID-${nanoid(12).toUpperCase()}`
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")

  if (!sessionToken) {
    return null
  }

  try {
    const result = await sql`
      SELECT id, uid, email, username, role, balance, is_timed_out, timeout_until, created_at, profile_picture, discord_id, discord_username
      FROM users
      WHERE uid = ${sessionToken.value}
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0] as User

    // Check if timeout has expired
    if (user.is_timed_out && user.timeout_until) {
      const timeoutDate = new Date(user.timeout_until)
      if (timeoutDate < new Date()) {
        // Clear timeout
        await sql`
          UPDATE users
          SET is_timed_out = false, timeout_until = NULL
          WHERE id = ${user.id}
        `
        user.is_timed_out = false
        user.timeout_until = null
      }
    }

    return user
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}

// Create session
export async function createSession(uid: string) {
  const cookieStore = await cookies()
  cookieStore.set("session_token", uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

// Destroy session
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session_token")
}

// Check if user is admin or owner
export function isAdminOrOwner(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "owner"
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}

// Check if user is owner
export function isOwner(user: User | null): boolean {
  return user?.role === "owner"
}

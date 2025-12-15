import { NextResponse } from "next/server"
import { headers } from "next/headers"

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID

export async function GET(request: Request) {
  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json({ error: "Discord OAuth not configured" }, { status: 500 })
  }

  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`
  const redirectUri = `${baseUrl}/api/auth/discord/callback`

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
  })

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  return NextResponse.redirect(discordAuthUrl)
}

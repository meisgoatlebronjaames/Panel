import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { sql } from "@/lib/db"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || ""
const DISCORD_LINK_BONUS_CHIPS = 100

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`
  const redirectUri = `${baseUrl}/api/auth/discord/callback`

  if (error) {
    return NextResponse.redirect(`${baseUrl}/settings?discord_error=access_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/settings?discord_error=no_code`)
  }

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(`${baseUrl}/settings?discord_error=not_configured`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/settings?discord_error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get Discord user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/settings?discord_error=user_fetch_failed`)
    }

    const discordUser = await userResponse.json()

    // Get the current user from session
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.redirect(`${baseUrl}/login?discord_error=not_logged_in`)
    }

    // Verify user session
    const userResult = await sql`
      SELECT id, discord_id FROM users WHERE uid = ${sessionId}
    `

    if (userResult.length === 0) {
      return NextResponse.redirect(`${baseUrl}/login?discord_error=invalid_session`)
    }

    // Check if Discord ID is already linked to another account
    const existingDiscord = await sql`
      SELECT id FROM users WHERE discord_id = ${discordUser.id} AND id != ${userResult[0].id}
    `

    if (existingDiscord.length > 0) {
      return NextResponse.redirect(`${baseUrl}/settings?discord_error=already_linked`)
    }

    const wasAlreadyLinked = userResult[0].discord_id !== null

    let bonusAwarded = false
    let isInServer = false

    if (DISCORD_SERVER_ID) {
      try {
        const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (guildResponse.ok) {
          const guilds = await guildResponse.json()
          isInServer = guilds.some((guild: { id: string }) => guild.id === DISCORD_SERVER_ID)

          // Only award bonus if not already linked AND user is in the server
          if (!wasAlreadyLinked && isInServer) {
            await sql`
              UPDATE users 
              SET balance = balance + ${DISCORD_LINK_BONUS_CHIPS}
              WHERE id = ${userResult[0].id}
            `

            // Log the bonus transaction
            await sql`
              INSERT INTO balance_transactions (user_id, amount, transaction_type, note)
              VALUES (${userResult[0].id}, ${DISCORD_LINK_BONUS_CHIPS}, 'discord_link_bonus', 'Bonus for linking Discord account')
            `

            bonusAwarded = true
          }
        }
      } catch (guildError) {
        console.error("Error checking guild membership:", guildError)
      }
    }

    // Update user with Discord info
    await sql`
      UPDATE users 
      SET 
        discord_id = ${discordUser.id},
        discord_username = ${discordUser.username}
      WHERE id = ${userResult[0].id}
    `

    let successParam = "discord_success=linked"
    if (bonusAwarded) {
      successParam = `discord_success=bonus&bonus=${DISCORD_LINK_BONUS_CHIPS}`
    } else if (!isInServer && DISCORD_SERVER_ID) {
      successParam = "discord_success=linked_no_bonus"
    }

    return NextResponse.redirect(`${baseUrl}/settings?${successParam}`)
  } catch (error) {
    console.error("Discord OAuth error:", error)
    return NextResponse.redirect(`${baseUrl}/settings?discord_error=unknown`)
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

/**
 * GET /api/gmail/connect
 *
 * Inicia el flujo OAuth2 de Gmail SEPARADO del login de Google en Supabase.
 * El login de Supabase pide solo "email profile".
 * Este endpoint pide permisos de Gmail para leer/enviar correos.
 *
 * Scopes solicitados:
 *   - gmail.readonly  → leer correos
 *   - gmail.send      → enviar correos
 *   - gmail.modify    → marcar como leído, archivar
 *   - userinfo.email  → identificar la cuenta Gmail
 *
 * SEGURIDAD:
 *   - GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET son variables server-side.
 *   - El state anti-CSRF incluye el user.id del tenant y un timestamp.
 *   - Los tokens OAuth se guardan server-side en /api/gmail/callback.
 *   - Nada de esto llega al browser.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/auth`)
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID

  if (!googleClientId) {
    return NextResponse.redirect(`${siteUrl}/dashboard?gmail_error=not_configured`)
  }

  const redirectUri = `${siteUrl}/api/gmail/callback`

  // State: base64url(JSON) — tenant id + timestamp anti-CSRF (10 min TTL)
  const state = Buffer.from(
    JSON.stringify({ tenant: user.id, ts: Date.now() }),
  ).toString("base64url")

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  )
}

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  getUserOrganization,
  updateOrganization,
} from "@/lib/services/supabase-provisioning-service"

/**
 * GET /api/gmail/callback
 *
 * Recibe el código OAuth2 de Google tras el consentimiento del usuario.
 * Canjea el código por access_token + refresh_token y los guarda
 * server-side en la organización del tenant.
 *
 * SEGURIDAD:
 *   - Los tokens NUNCA se exponen al cliente (browser, logs, respuestas JSON).
 *   - El state anti-CSRF valida que el tenant del callback coincide con
 *     el usuario autenticado y que no tiene más de 10 minutos.
 *   - GOOGLE_CLIENT_SECRET solo existe en variables server-side.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const errorParam = searchParams.get("error")

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const dashboardUrl = `${siteUrl}/dashboard`

  // Usuario denegó acceso
  if (errorParam === "access_denied") {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=denied`)
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=invalid_callback`)
  }

  // Validar sesión activa
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/auth`)
  }

  // Validar state anti-CSRF
  try {
    const stateData = JSON.parse(Buffer.from(stateParam, "base64url").toString())
    if (stateData.tenant !== user.id) {
      return NextResponse.redirect(`${dashboardUrl}?gmail_error=state_mismatch`)
    }
    if (Date.now() - stateData.ts > 10 * 60 * 1000) {
      return NextResponse.redirect(`${dashboardUrl}?gmail_error=state_expired`)
    }
  } catch {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=invalid_state`)
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=not_configured`)
  }

  const redirectUri = `${siteUrl}/api/gmail/callback`

  // Canjear código por tokens (server-side only)
  let tokens: { access_token: string; refresh_token?: string; expires_in: number }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${dashboardUrl}?gmail_error=token_exchange_failed`)
    }

    tokens = await tokenRes.json()
  } catch {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=token_exchange_failed`)
  }

  // Obtener email de la cuenta Gmail autorizada (no crítico si falla)
  let gmailEmail: string | null = null
  try {
    const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (meRes.ok) {
      const me = await meRes.json()
      gmailEmail = me.email ?? null
    }
  } catch {
    // No crítico — guardamos los tokens de todas formas
  }

  // Leer organización del tenant
  const org = await getUserOrganization()
  if (!org) {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=no_organization`)
  }

  // Guardar tokens server-side (NUNCA llegan al cliente)
  const patch: Record<string, unknown> = {
    gmail_access_token: tokens.access_token,
    gmail_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    gmail_email: gmailEmail,
    gmail_connected: true,
  }
  // refresh_token solo se actualiza si Google lo devuelve (no siempre lo hace)
  if (tokens.refresh_token) {
    patch.gmail_refresh_token = tokens.refresh_token
  }

  try {
    await updateOrganization(org.id, patch)
  } catch {
    return NextResponse.redirect(`${dashboardUrl}?gmail_error=save_failed`)
  }

  return NextResponse.redirect(`${dashboardUrl}?gmail_connected=1`)
}

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserOrganization } from "@/lib/services/supabase-provisioning-service"

/**
 * GET /api/chatwoot/onboarding-url
 *
 * Devuelve la URL del onboarding nativo de Chatwoot para el tenant.
 * El cliente abre esta URL en nueva pestaña para completar la configuración
 * inicial (nombre, empresa, idioma, zona horaria) del agente en Chatwoot.
 *
 * El parámetro returnTo apunta al dashboard con señal de completado
 * para que el tenant pueda volver al flujo de SmarterCRM.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const org = await getUserOrganization()
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 409 })
  }

  const chatwootBase = process.env.CHATWOOT_BASE_URL
  const chatwootAccountId =
    process.env.NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID ?? process.env.CHATWOOT_ACCOUNT_ID

  if (!chatwootBase || !chatwootAccountId) {
    return NextResponse.json({ error: "Chatwoot not configured" }, { status: 503 })
  }

  const onboardingUrl = `${chatwootBase}/app/accounts/${chatwootAccountId}/onboarding`

  const { origin } = new URL(request.url)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const returnTo = `${siteUrl}/dashboard?chatwoot_onboarding=done`

  return NextResponse.json({
    url: onboardingUrl,
    returnTo,
    alreadyDone: org.chatwoot_onboarding_done,
    chatwootAppUrl: `${chatwootBase}/app/accounts/${chatwootAccountId}`,
  })
}

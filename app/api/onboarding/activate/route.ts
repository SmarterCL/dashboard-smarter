import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { bootstrapWorkspace } from "@/lib/bootstrap-workspace"

/**
 * POST /api/onboarding/activate
 *
 * Activa el workspace del tenant autenticado:
 *   1. Valida la sesión de Supabase Auth.
 *   2. Ejecuta bootstrapWorkspace (Chatwoot + WAHA provisioning, tolerante a fallos).
 *   3. Retorna el estado del bootstrap sin exponer tokens ni secrets.
 *
 * Idempotente: si el workspace ya está activo, retorna alreadyBootstrapped=true.
 *
 * SEGURIDAD: No expone gmail_access_token, gmail_refresh_token, WAHA_API_KEY
 * ni ningún secreto en la respuesta.
 */
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Autenticacion requerida." }, { status: 401 })
  }

  try {
    const result = await bootstrapWorkspace({
      id: user.id,
      email: user.email ?? "",
      phone: (user.user_metadata?.phone as string | undefined) ?? undefined,
      fullName:
        [user.user_metadata?.first_name, user.user_metadata?.last_name]
          .filter(Boolean)
          .join(" ") || undefined,
      company: (user.user_metadata?.company as string | undefined) ?? undefined,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "No se encontro la organizacion del usuario." },
        { status: 409 },
      )
    }

    return NextResponse.json({
      ok: true,
      alreadyBootstrapped: result.alreadyBootstrapped,
      organization: result.organization
        ? {
            id: result.organization.id,
            slug: result.organization.slug,
            name: result.organization.name,
            plan: result.organization.plan_slug,
            currency: result.organization.currency,
            bootstrap_status: result.organization.bootstrap_status,
            chatwoot_status: result.organization.chatwoot_status,
            chatwoot_onboarding_done: result.organization.chatwoot_onboarding_done,
            waha_status: result.organization.waha_status,
            // El waha_session_id se expone solo para que el frontend pueda
            // construir la URL del QR: qr.smarterbot.store/{session}
            // No es un secreto — el QR es público dado el session_id.
            waha_session_id: result.organization.waha_session_id,
            warnings: result.warnings,
          }
        : null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado." },
      { status: 500 },
    )
  }
}

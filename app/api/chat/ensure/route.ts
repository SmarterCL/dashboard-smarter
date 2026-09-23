import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserOrganization } from "@/lib/services/supabase-provisioning-service"

/**
 * POST /api/chat/ensure
 *
 * Devuelve el estado del workspace de chat del tenant autenticado.
 * Usado por el dashboard para saber si Chatwoot y WAHA están listos.
 *
 * Respuesta:
 *   {
 *     organizationId: string,
 *     slug: string | null,
 *     chatwoot: { status, action },
 *     waha: { status, qrStatus, sessionId, qrUrl }
 *   }
 *
 * El qrUrl apunta a qr.smarterbot.store/{session} — infraestructura existente.
 * No se genera QR base64 desde Next.js.
 */
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Sesion requerida." }, { status: 401 })
  }

  const organization = await getUserOrganization()

  if (!organization?.id) {
    return NextResponse.json({ error: "Organizacion no encontrada." }, { status: 409 })
  }

  // URL del QR externo (infraestructura existente, no generada aquí)
  const qrBaseUrl = process.env.WAHA_QR_BASE_URL ?? "https://qr.smarterbot.store"
  const qrUrl = organization.waha_session_id
    ? `${qrBaseUrl}/${encodeURIComponent(organization.waha_session_id)}`
    : null

  return NextResponse.json({
    organizationId: organization.id,
    slug: organization.slug,
    chatwoot: {
      status: organization.chatwoot_status,
      action: "open_widget_or_existing_thread",
    },
    waha: {
      status: organization.waha_status,
      qrStatus: organization.waha_qr_status,
      sessionId: organization.waha_session_id,
      // URL del QR externo (qr.smarterbot.store/{session})
      // El frontend usa esta URL para mostrar el QR sin generarlo desde Next.js
      qrUrl,
    },
  })
}

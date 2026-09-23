import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserOrganization } from "@/lib/services/supabase-provisioning-service"

/**
 * GET /api/gmail/status
 *
 * Devuelve si el canal Gmail está conectado para el tenant autenticado.
 * Solo expone datos no sensibles: estado de conexión y email display.
 *
 * SEGURIDAD: Nunca expone gmail_access_token ni gmail_refresh_token.
 */
export async function GET() {
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

  const connected = Boolean(org.gmail_connected)

  return NextResponse.json({
    connected,
    email: connected ? org.gmail_email : null,
  })
}

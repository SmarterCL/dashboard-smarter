import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserOrganization } from "@/lib/services/supabase-provisioning-service"

/**
 * GET /api/waha/status
 *
 * Devuelve el estado actual de la sesión WAHA del tenant autenticado.
 * Usado por WhatsAppConnectModal para polling cada 4s.
 *
 * Contrato (nuevo onboarding CRM):
 *   { status: "not_configured"|"no_session"|"scan_qr"|"working"|"failed"|"starting"|"stopped" }
 *   { status: "working", phone: "+56..." }  ← cuando está conectado
 *
 * DIFERENCIA con GET /api/waha/session (legacy dashboard):
 *   - /api/waha/session retorna { waha, workspace, trial } — contrato legacy
 *   - este endpoint retorna { status, phone? } — contrato del nuevo onboarding
 *   Ambos coexisten. NO consolidar todavía.
 *
 * SEGURIDAD:
 *   WAHA_API_KEY se usa solo en headers del fetch server-side.
 *   Nunca aparece en la respuesta JSON ni en logs.
 *   El waha_session_id se lee de la org del usuario autenticado.
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

  if (!org.waha_session_id) {
    return NextResponse.json({ status: "no_session" })
  }

  const wahaBase = process.env.WAHA_BASE_URL
  const wahaKey = process.env.WAHA_API_KEY

  if (!wahaBase || !wahaKey) {
    return NextResponse.json({ status: "not_configured" })
  }

  try {
    const res = await fetch(
      `${wahaBase}/api/sessions/${encodeURIComponent(org.waha_session_id)}`,
      {
        // SEGURIDAD: API key solo en headers server-side
        headers: { "X-Api-Key": wahaKey },
        cache: "no-store",
      },
    )

    if (!res.ok) {
      return NextResponse.json({ status: "failed" })
    }

    const data = await res.json()
    const rawStatus: string = (data.status ?? "").toUpperCase()

    const statusMap: Record<string, string> = {
      WORKING: "working",
      SCAN_QR_CODE: "scan_qr",
      STARTING: "starting",
      STOPPED: "stopped",
      FAILED: "failed",
    }

    const status = statusMap[rawStatus] ?? "failed"
    // Extraer número de teléfono del me.id de WAHA (formato: "56912345678@c.us")
    const rawPhone: string | undefined = data.me?.id
    const phone = rawPhone
      ? rawPhone.replace("@c.us", "").replace(/^(\d)/, "+$1")
      : undefined

    return NextResponse.json({
      status,
      phone: status === "working" ? phone : undefined,
    })
  } catch {
    return NextResponse.json({ status: "failed" })
  }
}

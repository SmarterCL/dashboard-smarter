import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  getUserOrganization,
  updateOrganization,
} from "@/lib/services/supabase-provisioning-service"

/**
 * POST /api/gmail/disconnect
 *
 * Revoca los tokens Gmail del tenant autenticado y limpia los campos
 * gmail_* en la organización.
 *
 * La revocación en Google es best-effort: si falla, los campos locales
 * se limpian de todas formas para que el usuario pueda reconectar.
 *
 * SEGURIDAD: gmail_access_token y gmail_refresh_token nunca aparecen
 * en la respuesta JSON. Solo se usan internamente para la revocación.
 */
export async function POST() {
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

  // Intentar revocar el token en Google (best-effort, no bloquea si falla)
  if (org.gmail_access_token) {
    try {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${org.gmail_access_token}`,
        { method: "POST" },
      )
    } catch {
      // Si Google rechaza la revocación, continuamos limpiando localmente
    }
  }

  // Limpiar todos los campos Gmail de la organización
  await updateOrganization(org.id, {
    gmail_access_token: null,
    gmail_refresh_token: null,
    gmail_token_expiry: null,
    gmail_email: null,
    gmail_connected: false,
  })

  return NextResponse.json({ ok: true })
}

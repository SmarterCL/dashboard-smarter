import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  getUserOrganization,
  updateOrganization,
} from "@/lib/services/supabase-provisioning-service"

/**
 * POST /api/chatwoot/onboarding-complete
 *
 * Marca el onboarding nativo de Chatwoot como completado para el tenant.
 * Se llama desde el dashboard cuando el tenant vuelve del onboarding de
 * Chatwoot (detectado via searchParam ?chatwoot_onboarding=done).
 *
 * Idempotente: si ya está marcado, retorna alreadyDone=true sin error.
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

  if (org.chatwoot_onboarding_done) {
    return NextResponse.json({ ok: true, alreadyDone: true })
  }

  await updateOrganization(org.id, { chatwoot_onboarding_done: true })

  return NextResponse.json({ ok: true, alreadyDone: false })
}

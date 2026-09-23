/**
 * Acceso a Supabase para el PROVISIONING del CRM.
 *
 * Usa el cliente de usuario autenticado (RLS activo) — NO service_role.
 * La protección real es Row Level Security configurada en la BD.
 *
 * Diferencia con lib/supabase.ts:
 *   - lib/supabase.ts          → service_role, bypass RLS, para runtime services legacy
 *   - este archivo             → user context, RLS enforced, para provisioning del CRM
 *
 * Importado y adaptado de Smarter-CRM/lib/services/supabase-service.ts.
 * Renombrado para dejar claro que es parte del stack de provisioning.
 */
import type { Organization } from "@/lib/services/provisioning-types"
import { createClient } from "@/utils/supabase/server"

export async function getUserOrganization(): Promise<Organization | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)

  if (error) {
    throw new Error(`Failed to read organization: ${error.message}`)
  }

  return data?.[0] ? normalizeOrganization(data[0]) : null
}

export async function updateOrganization(
  id: string,
  patch: Partial<Organization>,
): Promise<Organization> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organizations")
    .update(patch)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`)
  }

  return normalizeOrganization(data)
}

/**
 * Normaliza una fila cruda de la BD al tipo Organization,
 * aplicando defaults seguros para campos opcionales.
 *
 * SEGURIDAD: los tokens de Gmail (gmail_access_token, gmail_refresh_token)
 * se incluyen en el tipo solo para operaciones server-side. Nunca serializar
 * este objeto completo en respuestas de API.
 */
function normalizeOrganization(data: Partial<Organization>): Organization {
  return {
    id: data.id ?? "",
    owner_id: data.owner_id ?? "",
    name: data.name ?? null,
    slug: data.slug ?? null,
    plan_slug: data.plan_slug ?? "trial",
    billing_status: data.billing_status ?? "trial",
    billing_provider: data.billing_provider ?? null,
    billing_external_id: data.billing_external_id ?? null,
    current_period_end: data.current_period_end ?? null,
    country: data.country ?? "CL",
    currency: data.currency ?? "CLP",
    timezone: data.timezone ?? "America/Santiago",
    locale: data.locale ?? "es",
    bootstrap_status: data.bootstrap_status ?? "pending",
    chatwoot_status: data.chatwoot_status ?? "pending",
    chatwoot_contact_id: data.chatwoot_contact_id ?? null,
    chatwoot_conversation_id: data.chatwoot_conversation_id ?? null,
    chatwoot_agent_id: data.chatwoot_agent_id ?? null,
    chatwoot_onboarding_done: data.chatwoot_onboarding_done ?? false,
    waha_session_id: data.waha_session_id ?? null,
    waha_status: data.waha_status ?? "pending",
    waha_qr_status: data.waha_qr_status ?? "pending",
    trial_started_at: data.trial_started_at ?? null,
    trial_ends_at: data.trial_ends_at ?? null,
    plan_status: data.plan_status ?? "trial",
    gmail_connected: data.gmail_connected ?? false,
    gmail_email: data.gmail_email ?? null,
    gmail_access_token: data.gmail_access_token ?? null,
    gmail_refresh_token: data.gmail_refresh_token ?? null,
    gmail_token_expiry: data.gmail_token_expiry ?? null,
  }
}

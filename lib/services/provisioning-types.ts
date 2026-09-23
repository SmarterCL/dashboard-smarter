/**
 * Tipos del sistema de provisioning (Smarter-CRM).
 *
 * IMPORTANTE: distinguir entre:
 *   - Organization (provisioning-types.ts) — modelo completo del CRM con todos
 *     los campos de estado, billing, Gmail, Chatwoot, WAHA.
 *   - Workspace (workspace-service.ts) — modelo legacy del dashboard con
 *     organization_members y trial_expires_at.
 *
 * Ambos modelos apuntan a la misma tabla `organizations` en Supabase.
 * El modelo Organization es el más completo y es el que usan los servicios
 * de provisioning y el nuevo dashboard/setup.
 *
 * Columna de divergencia:
 *   - dashboard: trial_expires_at
 *   - CRM:       trial_ends_at
 *   Ambas coexisten en la BD. El código de provisioning usa trial_ends_at.
 */

export type ProvisioningStatus = "pending" | "ready" | "failed"

export type Organization = {
  id: string
  owner_id: string
  name: string | null
  slug: string | null
  // Billing / plan
  plan_slug: string
  billing_status: string
  billing_provider: string | null
  billing_external_id: string | null
  current_period_end: string | null
  country: string
  currency: string
  timezone: string
  locale: string
  // Bootstrap / provisioning state
  bootstrap_status: ProvisioningStatus | null
  chatwoot_status: ProvisioningStatus | null
  chatwoot_contact_id: number | null
  chatwoot_conversation_id: number | null
  chatwoot_agent_id: number | null
  chatwoot_onboarding_done: boolean
  waha_session_id: string | null
  waha_status: ProvisioningStatus | null
  waha_qr_status: ProvisioningStatus | null
  // Trial (columna del CRM — trial_ends_at)
  // Nota: el dashboard usa trial_expires_at; ambas coexisten en la BD.
  trial_started_at: string | null
  trial_ends_at: string | null
  plan_status: string | null
  // Gmail channel
  gmail_connected: boolean
  gmail_email: string | null
  // Tokens Gmail: NUNCA exponer al cliente
  gmail_access_token: string | null
  gmail_refresh_token: string | null
  gmail_token_expiry: string | null
}

export type BootstrapUser = {
  id: string
  email: string
  phone?: string
  fullName?: string
  company?: string
}

export type BootstrapResult = {
  ok: boolean
  organization: Organization | null
  alreadyBootstrapped: boolean
  warnings: string[]
  error?: string
}

import type { User } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * Workspace — vista legacy del modelo organizations.
 *
 * Apunta a la tabla `organizations` en Supabase.
 * Solo incluye columnas que realmente existen en la BD.
 *
 * Columnas eliminadas (no existen en organizations):
 *   - billing_email   → no persiste en este esquema
 *   - updated_at      → organizations no tiene updated_at
 *   - chatwoot_source_id → no persiste; se usa solo en memoria durante provisioning
 *   - trial_expires_at → reemplazado por trial_ends_at (canónico en BD)
 *
 * Para membership: se usa la tabla `memberships` (columnas: org_id, user_id, role).
 * La tabla `organization_members` fue un artefacto del esquema legacy y no existe en BD.
 */
export type Workspace = {
  id: string
  name: string
  slug: string | null
  created_at: string
  owner_id: string
  chatwoot_contact_id: number | null
  chatwoot_conversation_id: number | null
  waha_session_id: string | null
  trial_started_at: string | null
  /** Canónico en BD — era trial_expires_at en el código legacy */
  trial_ends_at: string | null
}

export type TrialState = {
  trialStartedAt: string
  trialExpiresAt: string
  isExpired: boolean
  daysRemaining: number
}

const TRIAL_DAYS = 7

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

export function getTrialState(
  user: Pick<User, "created_at">,
  workspace?: Partial<Workspace> | null,
): TrialState {
  const startedAt = new Date(workspace?.trial_started_at || user.created_at)
  // trial_ends_at es el campo canónico. El campo trial_expires_at fue eliminado.
  const expiresAt = new Date(
    workspace?.trial_ends_at || addDays(startedAt, TRIAL_DAYS),
  )
  const now = new Date()
  const msRemaining = expiresAt.getTime() - now.getTime()

  return {
    trialStartedAt: startedAt.toISOString(),
    trialExpiresAt: expiresAt.toISOString(),
    isExpired: msRemaining <= 0,
    daysRemaining: Math.max(0, Math.ceil(msRemaining / 86_400_000)),
  }
}

function workspaceName(user: Pick<User, "email" | "user_metadata">) {
  const metadataName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null
  return metadataName || user.email || "SmarterOS Workspace"
}

/**
 * Obtiene o crea el workspace (organization) del usuario autenticado.
 *
 * Estrategia:
 *   1. Buscar en organizations por owner_id = user.id (índice único en BD).
 *   2. Si no existe, crear la organización. El trigger organizations_owner_membership
 *      crea automáticamente la membership owner en la tabla memberships.
 *
 * Nota: Ya no usa organization_members (tabla que no existe en producción).
 * Tampoco usa memberships directamente aquí porque createServerSupabaseClient
 * puede operar sin sesión de usuario. El campo owner_id en organizations
 * es suficiente para identificar el workspace del usuario.
 */
export async function getOrCreateWorkspace(user: User): Promise<Workspace> {
  const supabase = createServerSupabaseClient()

  // 1. Buscar organización existente por owner_id
  const { data: existing, error: selectError } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, owner_id, created_at, chatwoot_contact_id, chatwoot_conversation_id, waha_session_id, trial_started_at, trial_ends_at",
    )
    .eq("owner_id", user.id)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existing) {
    await ensureTrialFields(existing as Workspace, user)
    return {
      ...(existing as Workspace),
      ...getMissingTrialFields(existing as Workspace, user),
    }
  }

  // 2. Crear nueva organización
  // El trigger organizations_owner_membership inserta automáticamente
  // la fila en memberships con role='owner'. No lo hacemos manualmente.
  const trial = getTrialState(user)
  const { data: workspace, error: insertError } = await supabase
    .from("organizations")
    .insert([
      {
        owner_id: user.id,
        name: workspaceName(user),
        trial_started_at: trial.trialStartedAt,
        trial_ends_at: trial.trialExpiresAt,
      },
    ])
    .select(
      "id, name, slug, owner_id, created_at, chatwoot_contact_id, chatwoot_conversation_id, waha_session_id, trial_started_at, trial_ends_at",
    )
    .single()

  if (insertError) {
    throw insertError
  }

  return workspace as Workspace
}

/**
 * Actualiza campos operativos del workspace.
 *
 * Campos permitidos: chatwoot_contact_id, chatwoot_conversation_id, waha_session_id.
 * chatwoot_source_id fue eliminado — no existe en la BD y no debe persistirse.
 */
export async function updateWorkspaceOperationalFields(
  workspaceId: string,
  fields: Partial<
    Pick<Workspace, "chatwoot_contact_id" | "chatwoot_conversation_id" | "waha_session_id">
  >,
) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("organizations")
    .update(fields)
    .eq("id", workspaceId)
    .select(
      "id, name, slug, owner_id, created_at, chatwoot_contact_id, chatwoot_conversation_id, waha_session_id, trial_started_at, trial_ends_at",
    )
    .single()

  if (error) {
    throw error
  }

  return data as Workspace
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de trial internos
// ─────────────────────────────────────────────────────────────────────────────

function getMissingTrialFields(workspace: Workspace, user: User) {
  const trial = getTrialState(user, workspace)
  return {
    trial_started_at: workspace.trial_started_at || trial.trialStartedAt,
    trial_ends_at: workspace.trial_ends_at || trial.trialExpiresAt,
  }
}

async function ensureTrialFields(workspace: Workspace, user: User) {
  if (workspace.trial_started_at && workspace.trial_ends_at) {
    return
  }

  const supabase = createServerSupabaseClient()
  const missingFields = getMissingTrialFields(workspace, user)
  const { error } = await supabase
    .from("organizations")
    .update(missingFields)
    .eq("id", workspace.id)

  if (error) {
    throw error
  }
}

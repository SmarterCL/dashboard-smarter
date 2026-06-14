import type { User } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase"

export type Workspace = {
  id: string
  name: string
  slug: string
  billing_email: string | null
  created_at: string
  updated_at: string
  chatwoot_contact_id: number | null
  chatwoot_conversation_id: number | null
  chatwoot_source_id: string | null
  waha_session_id: string | null
  trial_started_at: string | null
  trial_expires_at: string | null
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

export function getTrialState(user: Pick<User, "created_at">, workspace?: Partial<Workspace> | null): TrialState {
  const startedAt = new Date(workspace?.trial_started_at || user.created_at)
  const expiresAt = new Date(workspace?.trial_expires_at || addDays(startedAt, TRIAL_DAYS))
  const now = new Date()
  const msRemaining = expiresAt.getTime() - now.getTime()

  return {
    trialStartedAt: startedAt.toISOString(),
    trialExpiresAt: expiresAt.toISOString(),
    isExpired: msRemaining <= 0,
    daysRemaining: Math.max(0, Math.ceil(msRemaining / 86_400_000)),
  }
}

function workspaceSlug(userId: string) {
  return `workspace-${userId.slice(0, 8)}`
}

function workspaceName(user: Pick<User, "email" | "user_metadata">) {
  const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null
  return metadataName || user.email || "SmarterOS Workspace"
}

export async function getOrCreateWorkspace(user: User): Promise<Workspace> {
  const supabase = createServerSupabaseClient()

  const { data: existingMember, error: memberError } = await supabase
    .from("organization_members")
    .select("organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (memberError) {
    throw memberError
  }

  const existingWorkspace = existingMember?.organizations as Workspace | null | undefined
  if (existingWorkspace) {
    await ensureTrialFields(existingWorkspace, user)
    return {
      ...existingWorkspace,
      ...getMissingTrialFields(existingWorkspace, user),
    }
  }

  const trial = getTrialState(user)
  const { data: workspace, error: workspaceError } = await supabase
    .from("organizations")
    .insert([
      {
        name: workspaceName(user),
        slug: workspaceSlug(user.id),
        billing_email: user.email,
        trial_started_at: trial.trialStartedAt,
        trial_expires_at: trial.trialExpiresAt,
      },
    ])
    .select("*")
    .single()

  if (workspaceError) {
    throw workspaceError
  }

  const { error: ownerError } = await supabase.from("organization_members").insert([
    {
      organization_id: workspace.id,
      user_id: user.id,
      role: "owner",
    },
  ])

  if (ownerError) {
    throw ownerError
  }

  return workspace as Workspace
}

export async function updateWorkspaceOperationalFields(
  workspaceId: string,
  fields: Partial<
    Pick<Workspace, "chatwoot_contact_id" | "chatwoot_conversation_id" | "chatwoot_source_id" | "waha_session_id">
  >,
) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("organizations").update(fields).eq("id", workspaceId).select("*").single()

  if (error) {
    throw error
  }

  return data as Workspace
}

function getMissingTrialFields(workspace: Workspace, user: User) {
  const trial = getTrialState(user, workspace)
  return {
    trial_started_at: workspace.trial_started_at || trial.trialStartedAt,
    trial_expires_at: workspace.trial_expires_at || trial.trialExpiresAt,
  }
}

async function ensureTrialFields(workspace: Workspace, user: User) {
  if (workspace.trial_started_at && workspace.trial_expires_at) {
    return
  }

  const supabase = createServerSupabaseClient()
  const missingFields = getMissingTrialFields(workspace, user)
  const { error } = await supabase.from("organizations").update(missingFields).eq("id", workspace.id)

  if (error) {
    throw error
  }
}

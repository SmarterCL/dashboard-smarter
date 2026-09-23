import type { User } from "@supabase/supabase-js"
import {
  getOrCreateContact,
  getOrCreateConversation,
  validateChatwootToken,
  type ChatwootContact,
  type ChatwootConversation,
} from "@/lib/services/chatwoot-service"
import {
  getOrCreateWahaSession,
  getWahaSessionStatus,
  startWahaSession,
  type WahaSessionStatus,
} from "@/lib/services/waha-service"
import {
  getOrCreateWorkspace,
  getTrialState,
  type TrialState,
  type Workspace,
} from "@/lib/services/workspace-service"

export type BootstrapWorkspaceResult = {
  ok: true
  alreadyBootstrapped: boolean
  workspace: Workspace
  trial: TrialState
  contact: ChatwootContact
  conversation: ChatwootConversation
  waha: WahaSessionStatus
}

export async function bootstrapWorkspace(user: User): Promise<BootstrapWorkspaceResult> {
  const workspace = await getOrCreateWorkspace(user)
  const trial = getTrialState(user, workspace)

  if (trial.isExpired) {
    throw new Error("Trial expirado")
  }

  await validateChatwootToken()

  const wasBootstrapped = Boolean(
    workspace.chatwoot_contact_id && workspace.chatwoot_conversation_id && workspace.waha_session_id,
  )

  const contact = await getOrCreateContact(user, workspace)
  const workspaceWithContact = {
    ...workspace,
    chatwoot_contact_id: contact.id,
    // chatwoot_source_id fue eliminado — no existe en la BD ni en el tipo Workspace
  }

  const conversation = await getOrCreateConversation(contact, workspaceWithContact)
  const workspaceWithConversation = {
    ...workspaceWithContact,
    chatwoot_conversation_id: conversation.id,
  }

  const sessionId = await getOrCreateWahaSession(workspaceWithConversation)
  const workspaceWithWaha = {
    ...workspaceWithConversation,
    waha_session_id: sessionId,
  }

  await startWahaSession(workspaceWithWaha)
  const waha = await getWahaSessionStatus(workspaceWithWaha)

  return {
    ok: true,
    alreadyBootstrapped: wasBootstrapped,
    workspace: workspaceWithWaha,
    trial,
    contact,
    conversation,
    waha,
  }
}

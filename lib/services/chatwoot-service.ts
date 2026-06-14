import type { User } from "@supabase/supabase-js"
import {
  type Workspace,
  updateWorkspaceOperationalFields,
} from "@/lib/services/workspace-service"

export type ChatwootContact = {
  id: number
  name?: string | null
  email?: string | null
  identifier?: string | null
  contact_inboxes?: Array<{ source_id?: string | null }>
}

export type ChatwootConversation = {
  id: number
  account_id: number
  inbox_id: number
  status?: "open" | "resolved" | "pending"
  unread_count?: number
  last_activity_at?: number
  meta?: {
    sender?: ChatwootContact
  }
}

export type ChatwootMessage = {
  id: number
  content: string
  conversation_id: number
  message_type: number
  private: boolean
  status: string | null
  created_at: number
  sender_type?: string | null
}

function chatwootConfig() {
  const baseUrl = process.env.CHATWOOT_BASE_URL || process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "https://app.chatwoot.com"
  const accountId = process.env.CHATWOOT_ACCOUNT_ID
  const inboxId = process.env.CHATWOOT_INBOX_ID
  const apiAccessToken = process.env.CHATWOOT_API_ACCESS_TOKEN

  if (!accountId || !inboxId || !apiAccessToken) {
    throw new Error("Faltan CHATWOOT_ACCOUNT_ID, CHATWOOT_INBOX_ID o CHATWOOT_API_ACCESS_TOKEN")
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    accountId,
    inboxId: Number(inboxId),
    apiAccessToken,
  }
}

async function chatwootFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = chatwootConfig()
  const response = await fetch(`${config.baseUrl}/api/v1/accounts/${config.accountId}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      api_access_token: config.apiAccessToken,
      ...init?.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Chatwoot API error ${response.status}: ${body}`)
  }

  return response.json() as Promise<T>
}

function contactIdentifier(userId: string) {
  return `smarteros:${userId}`
}

function contactName(user: User) {
  const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null
  return metadataName || user.email || `Usuario ${user.id.slice(0, 8)}`
}

export async function getOrCreateContact(user: User, workspace: Workspace): Promise<ChatwootContact> {
  if (workspace.chatwoot_contact_id) {
    return {
      id: workspace.chatwoot_contact_id,
      name: contactName(user),
      email: user.email,
      identifier: contactIdentifier(user.id),
    }
  }

  const identifier = contactIdentifier(user.id)
  const search = await chatwootFetch<{ payload?: ChatwootContact[] }>(
    `/contacts/search?q=${encodeURIComponent(identifier)}`,
  )
  const existing = search.payload?.find((contact) => contact.identifier === identifier)

  if (existing?.id) {
    await updateWorkspaceOperationalFields(workspace.id, { chatwoot_contact_id: existing.id })
    return existing
  }

  const config = chatwootConfig()
  const created = await chatwootFetch<ChatwootContact>("/contacts", {
    method: "POST",
    body: JSON.stringify({
      inbox_id: config.inboxId,
      name: contactName(user),
      email: user.email,
      identifier,
      additional_attributes: {
        workspace_id: workspace.id,
        supabase_user_id: user.id,
      },
    }),
  })

  await updateWorkspaceOperationalFields(workspace.id, { chatwoot_contact_id: created.id })
  return created
}

export async function getOrCreateConversation(
  contactId: number,
  workspace: Workspace,
): Promise<ChatwootConversation> {
  if (workspace.chatwoot_conversation_id) {
    return {
      id: workspace.chatwoot_conversation_id,
      account_id: Number(chatwootConfig().accountId),
      inbox_id: chatwootConfig().inboxId,
      status: "open",
    }
  }

  const config = chatwootConfig()
  const conversation = await chatwootFetch<ChatwootConversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      source_id: `smarteros-workspace-${workspace.id}`,
      inbox_id: config.inboxId,
      contact_id: contactId,
      status: "open",
      custom_attributes: {
        workspace_id: workspace.id,
      },
    }),
  })

  await updateWorkspaceOperationalFields(workspace.id, { chatwoot_conversation_id: conversation.id })
  return conversation
}

export async function sendMessage(conversationId: number | string, message: string): Promise<ChatwootMessage> {
  return chatwootFetch<ChatwootMessage>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: message,
      message_type: "outgoing",
      private: false,
      content_type: "text",
    }),
  })
}

export async function getMessages(conversationId: number | string): Promise<ChatwootMessage[]> {
  const response = await chatwootFetch<{ payload?: ChatwootMessage[] }>(`/conversations/${conversationId}/messages`)
  return response.payload || []
}

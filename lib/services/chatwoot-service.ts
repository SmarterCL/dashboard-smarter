import type { User } from "@supabase/supabase-js"
import { type Workspace, updateWorkspaceOperationalFields } from "@/lib/services/workspace-service"

export type ChatwootAccount = {
  id: number
  name?: string | null
}

export type ChatwootContact = {
  id: number
  source_id?: string | null
  pubsub_token?: string | null
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
  const baseUrl =
    process.env.CHATWOOT_BASE_URL || process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "https://app.chatwoot.com"
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

async function chatwootPublicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = chatwootConfig()
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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

async function chatwootRootFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = chatwootConfig()
  const response = await fetch(`${config.baseUrl}${path}`, {
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

async function chatwootAccountFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = chatwootConfig()
  return chatwootRootFetch<T>(`/api/v1/accounts/${config.accountId}${path}`, init)
}

function contactIdentifier(userId: string) {
  return `smarteros:${userId}`
}

function contactName(user: User) {
  const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null
  return metadataName || user.email || `Usuario ${user.id.slice(0, 8)}`
}

export async function validateChatwootToken(): Promise<ChatwootAccount[]> {
  return chatwootRootFetch<ChatwootAccount[]>("/api/v1/accounts")
}

export async function getOrCreateContact(user: User, workspace: Workspace): Promise<ChatwootContact> {
  // Si ya tenemos el contact_id, reconstruir el objeto en memoria sin llamar a Chatwoot.
  // source_id no se persiste en organizations (columna eliminada); se obtiene de Chatwoot
  // solo cuando se necesita crear una conversación nueva.
  if (workspace.chatwoot_contact_id) {
    return {
      id: workspace.chatwoot_contact_id,
      source_id: null, // se resolverá desde Chatwoot si se necesita una conversación nueva
      name: contactName(user),
      email: user.email,
      identifier: contactIdentifier(user.id),
    }
  }

  const config = chatwootConfig()
  const phoneNumber = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : undefined

  const created = await chatwootPublicFetch<ChatwootContact>(`/public/api/v1/inboxes/${config.inboxId}/contacts`, {
    method: "POST",
    body: JSON.stringify({
      identifier: contactIdentifier(user.id),
      name: contactName(user),
      email: user.email,
      phone_number: phoneNumber,
    }),
  })

  // Solo persistir chatwoot_contact_id. chatwoot_source_id no existe en la BD.
  await updateWorkspaceOperationalFields(workspace.id, {
    chatwoot_contact_id: created.id,
  })

  return created
}

export async function getOrCreateConversation(
  contact: ChatwootContact,
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

  // source_id del contacto: puede venir de la respuesta de Chatwoot o
  // buscarse en contact_inboxes. Si no está disponible, crear igualmente
  // usando contact_id (Chatwoot lo acepta sin source_id en POST /conversations).
  const config = chatwootConfig()
  const conversation = await chatwootAccountFetch<ChatwootConversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      ...(contact.source_id ? { source_id: contact.source_id } : {}),
      inbox_id: config.inboxId,
      contact_id: contact.id,
      status: "open",
    }),
  })

  // Solo persiste conversation_id. chatwoot_source_id no existe en la BD.
  await updateWorkspaceOperationalFields(workspace.id, {
    chatwoot_conversation_id: conversation.id,
  })

  return conversation
}

export async function sendMessage(
  conversationId: number | string,
  contactId: number | string,
  message: string,
): Promise<ChatwootMessage> {
  const config = chatwootConfig()
  return chatwootPublicFetch<ChatwootMessage>(
    `/public/api/v1/inboxes/${config.inboxId}/contacts/${contactId}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content: message,
        echo_id: `smarteros-${Date.now()}`,
      }),
    },
  )
}

export async function getMessages(conversationId: number | string): Promise<ChatwootMessage[]> {
  const response = await chatwootAccountFetch<{ payload?: ChatwootMessage[] }>(`/conversations/${conversationId}/messages`)
  return response.payload || []
}

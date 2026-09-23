/**
 * Chatwoot PROVISIONING service.
 *
 * Responsabilidad: crear/obtener el agente, contacto y conversación
 * del tenant en Chatwoot durante el onboarding.
 *
 * DIFERENCIA CON lib/services/chatwoot-service.ts (runtime):
 *   - chatwoot-service.ts      → operaciones runtime (mensajes, conversaciones
 *                                 del chat en vivo del dashboard)
 *   - este archivo             → provisioning one-time (agente = operador del
 *                                 tenant; contacto = tenant como cliente de soporte)
 *
 * Variable de entorno:
 *   Soporta CHATWOOT_API_TOKEN (Smarter-CRM) y CHATWOOT_API_ACCESS_TOKEN
 *   (dashboard-smarter legacy) mediante una función helper interna.
 *   El código siempre pasa por getChatwootApiToken() — nunca lee la variable
 *   directamente — para evitar duplicación de lógica.
 *
 * Importado de Smarter-CRM/lib/services/chatwoot-service.ts y adaptado.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de entrada
// ─────────────────────────────────────────────────────────────────────────────

type ChatwootContactInput = {
  existingContactId?: number | null
  name: string
  email: string
  phoneNumber?: string
  customAttributes?: Record<string, unknown>
}

type ChatwootConversationInput = {
  existingConversationId?: number | null
  contactId: number
  sourceId: string
}

type ChatwootAgentInput = {
  existingAgentId?: number | null
  name: string
  email: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración — abstracción de variables de entorno
// ─────────────────────────────────────────────────────────────────────────────

function getChatwootApiToken(): string | undefined {
  // CHATWOOT_API_TOKEN (Smarter-CRM) o CHATWOOT_API_ACCESS_TOKEN (dashboard legacy)
  return process.env.CHATWOOT_API_TOKEN ?? process.env.CHATWOOT_API_ACCESS_TOKEN
}

function chatwootProvisioningHeaders() {
  const apiToken = getChatwootApiToken()
  if (!apiToken) {
    throw new Error(
      "Chatwoot API token not configured. Set CHATWOOT_API_TOKEN in .env.local",
    )
  }
  return {
    api_access_token: apiToken,
    "Content-Type": "application/json",
  }
}

const baseUrl = process.env.CHATWOOT_BASE_URL
const accountId = process.env.CHATWOOT_ACCOUNT_ID
const inboxId = process.env.CHATWOOT_INBOX_ID

// ─────────────────────────────────────────────────────────────────────────────
// AGENT — el tenant como operador/agente en su bandeja
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea al owner del tenant como agente administrador en la cuenta Chatwoot.
 * Si ya existe un agente con ese email, lo reutiliza.
 * El rol "administrator" permite al tenant completar el onboarding nativo
 * y configurar su propia bandeja.
 *
 * Requiere CHATWOOT_API_TOKEN/CHATWOOT_API_ACCESS_TOKEN de administrador.
 */
export async function getOrCreateChatwootAgent(input: ChatwootAgentInput) {
  if (input.existingAgentId) {
    return { id: input.existingAgentId, reused: true }
  }

  if (!baseUrl || !accountId) {
    throw new Error("Chatwoot provisioning API is not configured")
  }

  // Buscar si ya existe un agente con ese email
  const existing = await searchAgent(input.email)
  if (existing?.id) {
    return { id: Number(existing.id), reused: true }
  }

  const response = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/agents`, {
    method: "POST",
    headers: chatwootProvisioningHeaders(),
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      role: "administrator",
    }),
  })

  // 422 puede indicar race condition (email ya existe) — buscar de nuevo
  if (response.status === 422) {
    const existing2 = await searchAgent(input.email)
    if (existing2?.id) {
      return { id: Number(existing2.id), reused: true }
    }
    const errText = await response.text()
    throw new Error(`Failed to create Chatwoot agent: ${errText}`)
  }

  if (!response.ok) {
    throw new Error(`Failed to create Chatwoot agent: ${response.status}`)
  }

  const data = await response.json()
  const id = data?.id ?? data?.payload?.id
  if (!id) {
    throw new Error("Chatwoot agent response did not include id")
  }

  return { id: Number(id), reused: false }
}

async function searchAgent(email: string) {
  if (!baseUrl || !accountId) return null

  try {
    const headers = chatwootProvisioningHeaders()
    const response = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/agents`,
      { headers },
    )
    if (!response.ok) return null

    const data: Array<{ id: number; email: string }> = await response.json()
    return Array.isArray(data)
      ? (data.find((a) => a.email === email) ?? null)
      : null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT — el tenant como contacto de soporte (tracking interno)
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateChatwootContact(input: ChatwootContactInput) {
  if (input.existingContactId) {
    return { id: input.existingContactId, reused: true }
  }

  if (!baseUrl || !accountId || !inboxId) {
    throw new Error("Chatwoot provisioning API is not configured")
  }

  const existing = await searchContact(input.email)
  if (existing?.id) {
    return { id: existing.id, reused: true }
  }

  const response = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/contacts`, {
    method: "POST",
    headers: chatwootProvisioningHeaders(),
    body: JSON.stringify({
      inbox_id: Number(inboxId),
      name: input.name,
      email: input.email,
      phone_number: input.phoneNumber,
      custom_attributes: input.customAttributes,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create Chatwoot contact: ${response.status}`)
  }

  const data = await response.json()
  const id = data?.payload?.contact?.id ?? data?.id
  if (!id) {
    throw new Error("Chatwoot contact response did not include id")
  }

  return { id: Number(id), reused: false }
}

async function searchContact(email: string) {
  if (!baseUrl || !accountId) return null

  try {
    const headers = chatwootProvisioningHeaders()
    const response = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/contacts/search?q=${encodeURIComponent(email)}`,
      { headers },
    )
    if (!response.ok) return null

    const data = await response.json()
    return data?.payload?.[0] ?? data?.[0] ?? null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION — conversación de soporte vinculada al contacto
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateChatwootConversation(input: ChatwootConversationInput) {
  if (input.existingConversationId) {
    return { id: input.existingConversationId, reused: true }
  }

  if (!baseUrl || !accountId || !inboxId) {
    throw new Error("Chatwoot provisioning API is not configured")
  }

  const response = await fetch(
    `${baseUrl}/api/v1/accounts/${accountId}/conversations`,
    {
      method: "POST",
      headers: chatwootProvisioningHeaders(),
      body: JSON.stringify({
        inbox_id: Number(inboxId),
        contact_id: input.contactId,
        source_id: input.sourceId,
        status: "open",
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to create Chatwoot conversation: ${response.status}`)
  }

  const data = await response.json()
  const id = data?.id ?? data?.payload?.id
  if (!id) {
    throw new Error("Chatwoot conversation response did not include id")
  }

  return { id: Number(id), reused: false }
}

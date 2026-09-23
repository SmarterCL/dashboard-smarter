/**
 * Bootstrap workspace — orquestador de provisioning del CRM.
 *
 * Ejecuta el flujo de activación de un nuevo tenant:
 *   1. Chatwoot: crear agente (operador) + contacto + conversación de soporte
 *   2. WAHA: registrar sesión del tenant
 *
 * DIFERENCIA CON lib/services/bootstrap-workspace.ts (runtime legacy):
 *   - lib/services/bootstrap-workspace.ts → usado por /api/chatwoot/conversations
 *     del dashboard legacy. Retorna workspace + trial + contact + conversation.
 *     Opera con service_role vía lib/supabase.ts.
 *   - este archivo (lib/bootstrap-workspace.ts) → usado por /api/onboarding/activate
 *     del nuevo sistema CRM. Retorna BootstrapResult con estados granulares.
 *     Opera con user context vía utils/supabase/server.ts (RLS enforced).
 *
 * TOLERANCIA A FALLOS:
 *   Cada paso es independiente. Un fallo en Chatwoot no impide crear la sesión
 *   WAHA. Los errores se acumulan en warnings[], no cancelan el proceso.
 *   El estado final (bootstrap_status) refleja si AMBOS servicios quedaron ready.
 *
 * Importado de Smarter-CRM/lib/bootstrap-workspace.ts y adaptado a los paths
 * del proyecto destino.
 */
import type {
  BootstrapResult,
  BootstrapUser,
  Organization,
} from "@/lib/services/provisioning-types"
import {
  getOrCreateChatwootContact,
  getOrCreateChatwootConversation,
  getOrCreateChatwootAgent,
} from "@/lib/services/chatwoot-provisioning-service"
import {
  getUserOrganization,
  updateOrganization,
} from "@/lib/services/supabase-provisioning-service"
import { createWahaProvisioningSession } from "@/lib/services/waha-provisioning-service"

export async function bootstrapWorkspace(user: BootstrapUser): Promise<BootstrapResult> {
  const warnings: string[] = []
  let organization = await getUserOrganization()

  if (!organization?.id) {
    return {
      ok: false,
      organization: null,
      alreadyBootstrapped: false,
      warnings,
      error: "organization_not_found",
    }
  }

  // Idempotente: si ya está completo, retornar inmediatamente
  if (
    organization.bootstrap_status === "ready" &&
    organization.chatwoot_agent_id &&
    organization.waha_session_id
  ) {
    return { ok: true, organization, alreadyBootstrapped: true, warnings }
  }

  organization = await safeUpdate(organization, { bootstrap_status: "pending" }, warnings)

  organization = await provisionChatwoot(user, organization, warnings)
  organization = await provisionWaha(organization, warnings)

  const bootstrapStatus =
    organization.chatwoot_status === "ready" && organization.waha_status === "ready"
      ? "ready"
      : "pending"

  organization = await safeUpdate(organization, { bootstrap_status: bootstrapStatus }, warnings)

  return { ok: true, organization, alreadyBootstrapped: false, warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provisioning Chatwoot
// ─────────────────────────────────────────────────────────────────────────────

async function provisionChatwoot(
  user: BootstrapUser,
  organization: Organization,
  warnings: string[],
): Promise<Organization> {
  try {
    // 1. Crear al tenant como AGENTE (operador de su bandeja)
    const agent = await getOrCreateChatwootAgent({
      existingAgentId: organization.chatwoot_agent_id,
      name: user.fullName ?? organization.name ?? user.email.split("@")[0],
      email: user.email,
    })

    // 2. Crear contacto de soporte (el tenant como cliente de SmarterOS)
    const contact = await getOrCreateChatwootContact({
      existingContactId: organization.chatwoot_contact_id,
      name: organization.name ?? "Workspace",
      email: user.email,
      customAttributes: {
        workspace_id: organization.id,
        organization_id: organization.id,
        tenant_slug: organization.slug,
      },
    })

    // 3. Conversación de soporte vinculada al contacto
    const conversation = await getOrCreateChatwootConversation({
      existingConversationId: organization.chatwoot_conversation_id,
      contactId: contact.id,
      sourceId: `workspace_${organization.id}`,
    })

    return safeUpdate(
      organization,
      {
        chatwoot_agent_id: agent.id,
        chatwoot_contact_id: contact.id,
        chatwoot_conversation_id: conversation.id,
        chatwoot_status: "ready",
      },
      warnings,
    )
  } catch (error) {
    warnings.push(
      error instanceof Error ? error.message : "Chatwoot provisioning failed",
    )
    return safeUpdate(organization, { chatwoot_status: "failed" }, warnings)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provisioning WAHA
// ─────────────────────────────────────────────────────────────────────────────

async function provisionWaha(
  organization: Organization,
  warnings: string[],
): Promise<Organization> {
  try {
    const session = await createWahaProvisioningSession({
      existingSessionId: organization.waha_session_id,
      // Patrón multi-tenant: smarter-{orgId}-{random8}
      // En el entorno actual puede resolverse a la sesión disponible (ej: SmarterOS)
      // via la variable de entorno WAHA_DEFAULT_SESSION o el propio ID generado.
      sessionId:
        organization.waha_session_id ??
        `smarter-${organization.id}-${crypto.randomUUID().slice(0, 8)}`,
      metadata: {
        organizationId: organization.id,
        tenantSlug: organization.slug,
      },
    })

    return safeUpdate(
      organization,
      {
        waha_session_id: session.sessionId,
        waha_status: "ready",
        waha_qr_status: "pending",
      },
      warnings,
    )
  } catch (error) {
    warnings.push(
      error instanceof Error ? error.message : "WAHA provisioning failed",
    )
    return safeUpdate(
      organization,
      { waha_status: "failed", waha_qr_status: "failed" },
      warnings,
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// safeUpdate — actualiza la BD sin cancelar el proceso si falla
// ─────────────────────────────────────────────────────────────────────────────

async function safeUpdate(
  organization: Organization,
  patch: Partial<Organization>,
  warnings: string[],
): Promise<Organization> {
  try {
    return await updateOrganization(organization.id, patch)
  } catch (error) {
    warnings.push(
      error instanceof Error ? error.message : "Organization update failed",
    )
    // Retornar el estado local fusionado para que el flujo continúe
    return { ...organization, ...patch }
  }
}

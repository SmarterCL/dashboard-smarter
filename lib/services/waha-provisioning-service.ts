/**
 * WAHA PROVISIONING service.
 *
 * Responsabilidad: registrar/crear la sesión WAHA del tenant durante
 * el onboarding. Solo operación de creación, no gestión de estado.
 *
 * DIFERENCIA CON lib/services/waha-service.ts (runtime):
 *   - waha-service.ts          → gestión runtime: estado, QR, start/stop,
 *                                 polling, sesión existente del dashboard
 *   - este archivo             → provisioning one-time: crear sesión nueva
 *                                 durante el onboarding del CRM
 *
 * MODELO MULTI-TENANT:
 *   Cada organización tiene su propia sesión WAHA identificada por
 *   waha_session_id en la tabla organizations.
 *   El campo waha_session_id puede ser cualquier string válido:
 *     - "SmarterOS" (sesión por defecto del entorno actual)
 *     - "smarter-{orgId}-{random8}" (provisioning automático futuro)
 *   NO hardcodear "SmarterOS" como solución permanente.
 *   El código siempre lee waha_session_id desde la organización.
 *
 * SEGURIDAD:
 *   WAHA_API_KEY es un secreto de infraestructura.
 *   Nunca exponer en: NEXT_PUBLIC_*, React, respuestas API, logs, Git.
 *   Solo vive en variables de entorno server-side.
 *
 * Importado de Smarter-CRM/lib/services/waha-service.ts y adaptado.
 */

type WahaSessionInput = {
  /** ID de sesión existente (si ya fue asignado, reutilizar) */
  existingSessionId?: string | null
  /** ID propuesto para la nueva sesión */
  sessionId: string
  phoneNumber?: string
  metadata?: Record<string, unknown>
}

/**
 * Crea o reutiliza una sesión WAHA para el tenant.
 *
 * Si existingSessionId está presente, retorna inmediatamente sin llamar a WAHA.
 * Si la sesión ya existe en WAHA (409 Conflict), la reutiliza.
 *
 * La API key de WAHA NUNCA debe aparecer en respuestas ni logs.
 */
export async function createWahaProvisioningSession(input: WahaSessionInput) {
  if (input.existingSessionId) {
    return { sessionId: input.existingSessionId, reused: true }
  }

  const wahaBaseUrl = process.env.WAHA_BASE_URL
  const wahaApiKey = process.env.WAHA_API_KEY

  if (!wahaBaseUrl || !wahaApiKey) {
    throw new Error("WAHA API is not configured (WAHA_BASE_URL, WAHA_API_KEY)")
  }

  const response = await fetch(`${wahaBaseUrl}/api/sessions`, {
    method: "POST",
    headers: {
      // SEGURIDAD: X-Api-Key solo va en headers server-side, nunca al cliente
      "X-Api-Key": wahaApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.sessionId,
      start: true,
      config: {
        metadata: {
          ...input.metadata,
          phoneNumber: input.phoneNumber,
        },
      },
    }),
  })

  // 409 = sesión ya existe → reutilizar
  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to create WAHA session: ${response.status}`)
  }

  return { sessionId: input.sessionId, reused: response.status === 409 }
}

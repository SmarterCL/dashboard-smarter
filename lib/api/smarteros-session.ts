/**
 * SmarterOS Session — capa de sesión unificada para API routes.
 *
 * Responsabilidades:
 *   1. Autenticación: validar sesión Supabase por cookies (no JWT en header).
 *   2. Workspace: obtener/crear el workspace del usuario autenticado.
 *   3. Trial: calcular si el trial está activo o expirado.
 *   4. Hermes interface (preparado): expone la estructura de conexión a Hermes
 *      sin implementarla todavía. Cuando Hermes esté disponible, las API routes
 *      que usen getSmarterOSSession recibirán hermesContext automáticamente.
 *
 * ARQUITECTURA DE REFERENCIA:
 *
 *   Web (Next.js)
 *    ↓
 *   Supabase (Auth + DB + RLS)
 *    ↓
 *   SmarterOS / Hermes API   ← esta capa se conecta aquí
 *    ↓
 *   Hermes VPS / Local
 *    ↓
 *   MCP → WAHA / n8n / Chatwoot / otros servicios
 *
 * SEGURIDAD:
 *   - HERMES_API_KEY nunca llega al browser (no NEXT_PUBLIC_*).
 *   - hermesContext solo existe server-side.
 *   - Los secretos de Hermes viven en variables de entorno del servidor.
 *   - getSmarterOSSession() solo se llama desde Route Handlers (server).
 */

import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  getOrCreateWorkspace,
  getTrialState,
  type TrialState,
  type Workspace,
} from "@/lib/services/workspace-service"

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de sesión
// ─────────────────────────────────────────────────────────────────────────────

export type SmarterOSSession = {
  user: User
  workspace: Workspace
  trial: TrialState
  /** Contexto Hermes — null hasta que Hermes esté configurado */
  hermes: HermesContext | null
}

/**
 * Interfaz de conexión a Hermes.
 *
 * La web puede conocer estos datos sin almacenar secretos en el browser.
 * Todos los campos son de solo lectura para el cliente (display/status).
 * Las operaciones reales (provisioning, agentes) las ejecuta Hermes directamente.
 *
 * Implementación futura: getSmarterOSSession() leerá HERMES_API_URL y
 * HERMES_API_KEY (server-side) para enriquecer esta estructura.
 */
export type HermesContext = {
  /** ID del nodo Hermes asignado al tenant (ej: "hermes-vps-01") */
  hermes_id: string | null
  /**
   * Entorno del nodo Hermes.
   * - "vps"   → Hermes VPS (producción)
   * - "local" → Hermes Local (desarrollo/testing)
   */
  environment: "vps" | "local" | "unknown"
  /**
   * Estado de salud reportado por Hermes.
   * - "healthy"      → respondiendo correctamente
   * - "degraded"     → respondiendo con errores parciales
   * - "unreachable"  → no responde
   * - "not_configured" → HERMES_API_URL no está configurada
   */
  health: "healthy" | "degraded" | "unreachable" | "not_configured"
  /**
   * Capacidades declaradas por el nodo Hermes.
   * Lista de strings: ["waha", "n8n", "chatwoot", "mcp", ...]
   * Vacío si Hermes no está configurado.
   */
  capabilities: string[]
  /**
   * Canales activos reportados por Hermes para este tenant.
   * Vacío hasta que Hermes implemente el endpoint de canales.
   */
  channels: HermesChannel[]
  /**
   * Servicios activos en el nodo Hermes.
   * Solo metadata pública — nunca incluir tokens ni keys.
   */
  services: HermesService[]
}

export type HermesChannel = {
  type: "whatsapp" | "chatwoot" | "gmail" | "calendar" | string
  status: "active" | "inactive" | "error"
  session_id?: string
}

export type HermesService = {
  name: string
  status: "running" | "stopped" | "error"
  version?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Error HTTP tipado
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getSmarterOSSession — entry point principal para API routes
// ─────────────────────────────────────────────────────────────────────────────

export async function getSmarterOSSession(options?: {
  /** Si false, no lanza error cuando el trial está expirado */
  requireActiveTrial?: boolean
}): Promise<SmarterOSSession> {
  const user = await getSupabaseUser()
  const workspace = await getOrCreateWorkspace(user)
  const trial = getTrialState(user, workspace)

  if (options?.requireActiveTrial !== false && trial.isExpired) {
    throw new ApiError("Trial expirado", 402)
  }

  // Hermes context: preparado pero no implementado todavía.
  // Cuando HERMES_API_URL esté disponible, esta función llamará al endpoint
  // de health/capabilities de Hermes y enriquecerá el contexto.
  // Por ahora retorna null para no bloquear el flujo.
  const hermes = await resolveHermesContext()

  return { user, workspace, trial, hermes }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hermes resolver — preparado, no implementado todavía
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el contexto de Hermes para el nodo configurado.
 *
 * SEGURIDAD:
 *   - HERMES_API_URL y HERMES_API_KEY son variables server-side solamente.
 *   - Nunca usar NEXT_PUBLIC_HERMES_* para secretos.
 *   - Esta función es llamada server-side únicamente (Route Handlers).
 *   - HermesContext que llega al browser NO incluye ningún token ni key.
 *
 * Cuando Hermes esté disponible:
 *   1. Configurar HERMES_API_URL y HERMES_API_KEY en .env.local
 *   2. Descomentar la implementación real abajo
 *   3. El contrato HermesContext se mantiene igual para los consumidores
 */
async function resolveHermesContext(): Promise<HermesContext | null> {
  const hermesApiUrl = process.env.HERMES_API_URL
  const hermesApiKey = process.env.HERMES_API_KEY

  // No configurado todavía → retornar null (no bloquear el flujo)
  if (!hermesApiUrl || !hermesApiKey) {
    return null
  }

  // Implementación futura — descomentar cuando Hermes esté disponible:
  //
  // try {
  //   const res = await fetch(`${hermesApiUrl}/health`, {
  //     headers: {
  //       // SEGURIDAD: API key nunca llega al browser
  //       "X-Api-Key": hermesApiKey,
  //       "Content-Type": "application/json",
  //     },
  //     cache: "no-store",
  //     signal: AbortSignal.timeout(3000), // timeout 3s para no bloquear
  //   })
  //
  //   if (!res.ok) {
  //     return {
  //       hermes_id: null,
  //       environment: "unknown",
  //       health: "degraded",
  //       capabilities: [],
  //       channels: [],
  //       services: [],
  //     }
  //   }
  //
  //   const data = await res.json()
  //   return {
  //     hermes_id: data.id ?? null,
  //     environment: data.environment ?? "unknown",
  //     health: "healthy",
  //     capabilities: data.capabilities ?? [],
  //     channels: data.channels ?? [],
  //     services: data.services ?? [],
  //   }
  // } catch {
  //   return {
  //     hermes_id: null,
  //     environment: "unknown",
  //     health: "unreachable",
  //     capabilities: [],
  //     channels: [],
  //     services: [],
  //   }
  // }

  // Placeholder hasta activar la implementación real
  return {
    hermes_id: null,
    environment: "unknown",
    health: "not_configured",
    capabilities: [],
    channels: [],
    services: [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

async function getSupabaseUser(): Promise<User> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ApiError("Supabase no está configurado", 500)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        )
      },
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError("No autorizado", 401)
  }

  return user
}

// ─────────────────────────────────────────────────────────────────────────────
// apiErrorResponse — helper para Route Handlers
// ─────────────────────────────────────────────────────────────────────────────

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  console.error("[API Error]", error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Error interno del servidor" },
    { status: 500 },
  )
}

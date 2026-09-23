/**
 * Cliente Supabase para el NAVEGADOR (componentes "use client").
 *
 * Usa únicamente la clave pública (anon/publishable key).
 * La protección real es Row Level Security en la base de datos.
 *
 * NUNCA usar SUPABASE_SERVICE_ROLE_KEY aquí.
 *
 * Compatible con:
 *   - dashboard-smarter (NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   - Smarter-CRM (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 * Ver utils/supabase/keys.ts para la abstracción de variables.
 */
import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseUrl, getSupabasePublicKey } from "@/utils/supabase/keys"

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublicKey())
}

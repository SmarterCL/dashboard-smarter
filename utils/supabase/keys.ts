/**
 * Abstracción centralizada para obtener las claves públicas de Supabase.
 *
 * Soporta dos nombres de variable por compatibilidad:
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY        (dashboard-smarter legacy)
 *   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (Smarter-CRM)
 *
 * Ambas pueden coexistir en .env.local. El código siempre pasa por aquí
 * en lugar de leer process.env directamente, evitando duplicación de lógica.
 *
 * NUNCA exponer SUPABASE_SERVICE_ROLE_KEY aquí ni en ningún archivo cliente.
 */
export function getSupabasePublicKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!key) {
    throw new Error(
      "Supabase public key not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    )
  }

  return key
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL not configured. Set it in .env.local",
    )
  }

  return url
}

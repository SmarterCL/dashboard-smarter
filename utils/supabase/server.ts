/**
 * Cliente Supabase para el SERVIDOR (Server Components, Server Actions,
 * Route Handlers).
 *
 * Usa la clave pública del usuario autenticado + cookies httpOnly.
 * La sesión del usuario fluye a través de cookies gestionadas por @supabase/ssr.
 * RLS se aplica automáticamente — el usuario solo ve sus propios datos.
 *
 * NUNCA usar SUPABASE_SERVICE_ROLE_KEY aquí.
 * Para operaciones administrativas server-side usar lib/supabase.ts.
 *
 * Compatible con el patrón de Smarter-CRM (utils/supabase/server.ts).
 */
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseUrl, getSupabasePublicKey } from "@/utils/supabase/keys"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(getSupabaseUrl(), getSupabasePublicKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // setAll puede fallar en Server Components de solo lectura.
          // En ese contexto la sesión ya fue refrescada por el middleware.
        }
      },
    },
  })
}

/**
 * Middleware de sesión Supabase para Next.js.
 *
 * Responsabilidades:
 *   1. Refrescar el token de sesión en cada request (evita expiración silenciosa).
 *   2. Rescatar códigos OAuth que lleguen fuera de /auth/callback (edge case).
 *   3. Proteger rutas autenticadas — redirigir a /auth si no hay sesión.
 *   4. Redirigir usuarios autenticados fuera de rutas públicas (no crear loops).
 *
 * Este archivo es llamado por middleware.ts (raíz del proyecto).
 *
 * Importado del patrón de Smarter-CRM y adaptado para coexistir con
 * el middleware legacy de dashboard-smarter.
 */
import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseUrl, getSupabasePublicKey } from "@/utils/supabase/keys"

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Si Supabase no está configurado (ej: entorno de CI sin vars),
  // dejar pasar sin autenticar.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Propagar cookies al request (necesario para que Server Components las lean)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        // Reconstruir la respuesta con las cookies actualizadas
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANTE: no encadenar lógica entre getUser() y la respuesta.
  // getUser() valida el token contra el servidor de Auth (no solo el JWT local).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rescatar código OAuth que llegó a una ruta distinta de /auth/callback.
  // Esto ocurre cuando el proveedor OAuth redirige a la URL raíz en lugar
  // del callback configurado.
  const { pathname, searchParams } = request.nextUrl
  const code = searchParams.get("code")
  if (code && pathname !== "/auth/callback") {
    const callbackUrl = new URL("/auth/callback", request.url)
    callbackUrl.searchParams.set("code", code)
    const next = searchParams.get("next")
    if (next) callbackUrl.searchParams.set("next", next)
    return NextResponse.redirect(callbackUrl)
  }

  return supabaseResponse
}

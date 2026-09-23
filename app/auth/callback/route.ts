import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

/**
 * GET /auth/callback
 *
 * Intercambia el código de Supabase (OAuth, confirmación de email,
 * reset de contraseña) por una sesión en cookies httpOnly.
 *
 * Flujos soportados:
 *   - OAuth Google (signup/login)
 *   - Confirmación de email (signup sin autoconfirm)
 *   - Reset de contraseña
 *
 * Lógica de redirección post-auth:
 *   next=/auth/reset-password → siempre respetar (flujo reset)
 *   next explícito             → respetar si es ruta interna válida
 *   Sin next o next=/dashboard:
 *     - Sin org → crear org y redirigir a /dashboard/setup
 *     - bootstrap_status=ready → /dashboard
 *     - otro → /dashboard/setup
 *
 * Anti open-redirect: next debe empezar por "/" y no por "//".
 *
 * Compatibilidad:
 *   - El dashboard legacy usaba este endpoint para OAuth (redirect a "/").
 *     Ahora redirige a /dashboard/setup para nuevos usuarios y a /dashboard
 *     para usuarios existentes con bootstrap completo.
 *   - /login y /register siguen usando AuthContext (client-side). No afectados.
 */
function getPublicOrigin(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  const host = request.headers.get("host")
  if (host) return `${forwardedProto}://${host}`
  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = getPublicOrigin(request)
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next") ?? ""

  // Validar next contra open-redirect
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : ""

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?mode=login&error=auth_callback_failed`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth?mode=login&error=auth_callback_failed`)
  }

  // Flujos con destino explícito que no son el dashboard genérico
  // (reset de contraseña, invitación de equipo, etc.)
  if (safeNext && safeNext !== "/dashboard" && safeNext !== "/dashboard/setup") {
    return NextResponse.redirect(`${origin}${safeNext}`)
  }

  // Para flujos que terminan en el dashboard: determinar destino según estado
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/auth?mode=login&error=auth_callback_failed`)
    }

    // Verificar organización del usuario
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, bootstrap_status")
      .order("created_at", { ascending: true })
      .limit(1)

    // Sin org → usuario nuevo (Google OAuth primera vez)
    if (!orgs?.length) {
      const company =
        (user.user_metadata?.company as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Mi empresa"

      // Crear org vía RPC (idempotente si ya existe)
      await supabase.rpc("create_my_organization", { p_name: company })
      return NextResponse.redirect(`${origin}/dashboard/setup`)
    }

    // Con org: redirigir según estado del bootstrap
    const bootstrapStatus = orgs[0]?.bootstrap_status
    const dest = bootstrapStatus === "ready" ? "/dashboard" : "/dashboard/setup"
    return NextResponse.redirect(`${origin}${dest}`)
  } catch {
    // Si algo falla en la lógica de redirección, caer al setup de forma segura
    return NextResponse.redirect(`${origin}/dashboard/setup`)
  }
}

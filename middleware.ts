/**
 * Middleware unificado — dashboard-smarter + Smarter-CRM
 *
 * Responsabilidades:
 *   1. Refrescar el token de sesión Supabase en cada request.
 *   2. Rescatar códigos OAuth que lleguen fuera de /auth/callback.
 *   3. Proteger rutas que requieren autenticación.
 *   4. Redirigir usuarios autenticados fuera de rutas de auth (sin loops).
 *   5. Redirigir a /upgrade cuando el trial está expirado.
 *
 * COEXISTENCIA DE SISTEMAS:
 *   Sistema legacy (dashboard-smarter):
 *     auth: /login, /register, /forgot-password, /reset-password
 *     redirect sin sesión → /login?redirectTo=...
 *     redirect con sesión en ruta pública → /
 *
 *   Sistema CRM (Smarter-CRM):
 *     auth: /auth, /auth/*, 
 *     redirect sin sesión → /auth
 *     redirect con sesión en /auth → /dashboard
 *
 *   Landing (solo lectura):
 *     /landing → siempre pública, nunca protegida
 *
 * ANTI-LOOPS garantizados:
 *   - /auth no redirige a /login (son sistemas paralelos)
 *   - /login no redirige a /auth
 *   - /auth/callback nunca redirige (es el destino de OAuth)
 *   - /upgrade no redirige cuando el trial está expirado (loop)
 *   - Las rutas /api/* quedan excluidas por el matcher
 *
 * HERMES:
 *   No incluir lógica Hermes aquí. El middleware es capa de sesión/auth,
 *   no de orquestación. Hermes vive en lib/api/smarteros-session.ts.
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// ─────────────────────────────────────────────────────────────────────────────
// Trial helper
// ─────────────────────────────────────────────────────────────────────────────

const TRIAL_DAYS = 7

function isTrialExpired(createdAt: string): boolean {
  const trialExpiresAt = new Date(createdAt)
  trialExpiresAt.setUTCDate(trialExpiresAt.getUTCDate() + TRIAL_DAYS)
  return trialExpiresAt.getTime() <= Date.now()
}

// ─────────────────────────────────────────────────────────────────────────────
// Clasificación de rutas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rutas públicas del sistema LEGACY (dashboard-smarter).
 * Estas rutas no requieren autenticación.
 */
const LEGACY_AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

/**
 * Rutas públicas del sistema CRM (Smarter-CRM).
 * Incluye /auth y todos sus sub-paths.
 */
const CRM_AUTH_ROUTES = [
  "/auth",       // /auth, /auth/forgot-password, /auth/reset-password
]

/**
 * Rutas siempre públicas (sin necesidad de auth en ningún sistema).
 */
const ALWAYS_PUBLIC_ROUTES = [
  "/landing",     // landing page CRM
  "/auth/callback", // OAuth callback — NUNCA redirigir aquí
]

/**
 * Rutas que nunca deben ser redirigidas aunque el trial esté expirado.
 */
const TRIAL_EXEMPT_ROUTES = [
  "/upgrade",
  "/auth",
  "/auth/callback",
  "/auth/reset-password",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/landing",
]

function isPublicPath(pathname: string): boolean {
  return (
    LEGACY_AUTH_ROUTES.some((r) => pathname.startsWith(r)) ||
    CRM_AUTH_ROUTES.some((r) => pathname.startsWith(r)) ||
    ALWAYS_PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
  )
}

function isLegacyAuthPath(pathname: string): boolean {
  return LEGACY_AUTH_ROUTES.some((r) => pathname.startsWith(r))
}

function isCrmAuthPath(pathname: string): boolean {
  // /auth pero NO /auth/callback (es siempre público)
  return pathname.startsWith("/auth") && !pathname.startsWith("/auth/callback")
}

function isTrialExempt(pathname: string): boolean {
  return TRIAL_EXEMPT_ROUTES.some((r) => pathname.startsWith(r))
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Sin Supabase configurado → dejar pasar (no bloquear en CI/preview sin vars)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() valida el token contra el servidor de Auth (no el JWT local).
  // IMPORTANTE: no hacer lógica de redirección entre getUser() y la respuesta.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Rescate de código OAuth fuera de /auth/callback ──────────────────────
  // Algunos proveedores OAuth redirigen a la raíz en lugar del callback.
  const code = request.nextUrl.searchParams.get("code")
  if (code && pathname !== "/auth/callback") {
    const callbackUrl = new URL("/auth/callback", request.url)
    callbackUrl.searchParams.set("code", code)
    const next = request.nextUrl.searchParams.get("next")
    if (next) callbackUrl.searchParams.set("next", next)
    return NextResponse.redirect(callbackUrl)
  }

  // ── Sin sesión: proteger rutas privadas ───────────────────────────────────
  if (!user && !isPublicPath(pathname)) {
    // Rutas del sistema CRM (/dashboard, /dashboard/setup) → /auth
    if (pathname.startsWith("/dashboard")) {
      const url = new URL("/auth", request.url)
      url.searchParams.set("mode", "login")
      return NextResponse.redirect(url)
    }
    // Todo lo demás (dashboard legacy: /, /chat, /clientes, etc.) → /login
    const url = new URL("/login", request.url)
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // ── Con sesión: redirigir fuera de rutas de auth ──────────────────────────
  if (user) {
    // Sistema legacy: /login, /register, /forgot-password, /reset-password
    // → redirect a / (dashboard legacy)
    if (isLegacyAuthPath(pathname)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Sistema CRM: /auth, /auth/forgot-password
    // (pero NO /auth/callback ni /auth/reset-password — son destinos válidos
    //  para usuarios autenticados en flujos de reset de contraseña)
    // → redirect a /dashboard (centro operativo CRM)
    if (
      isCrmAuthPath(pathname) &&
      !pathname.startsWith("/auth/reset-password")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Trial expirado: redirigir a /upgrade solo desde rutas privadas
    if (!isTrialExempt(pathname) && isTrialExpired(user.created_at)) {
      return NextResponse.redirect(new URL("/upgrade", request.url))
    }
  }

  return supabaseResponse
}

// ─────────────────────────────────────────────────────────────────────────────
// Matcher
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Excluir:
     *   - /api/* (todas las API routes — ninguna es protegida por middleware)
     *   - /_next/static, /_next/image (assets Next.js)
     *   - /favicon.ico, /images, archivos estáticos comunes
     *
     * Incluir: todas las rutas de página (/, /login, /auth, /dashboard, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}

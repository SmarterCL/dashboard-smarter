"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

// ─────────────────────────────────────────────────────────────────────────────
// Traducciones de errores de Supabase Auth al español
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_ERRORS_ES: Record<string, string> = {
  "Invalid login": "Correo o contraseña incorrectos",
  "Email not confirmed": "Debes confirmar tu correo antes de iniciar sesión",
  "User not found": "No existe una cuenta con este correo",
  "Invalid email": "El formato del correo no es válido",
  "Weak password": "La contraseña debe tener al menos 8 caracteres",
  "Password should be at least 8 characters": "La contraseña debe tener al menos 8 caracteres",
  "User already exists": "Ya existe una cuenta con este correo",
  "Email already registered": "Este correo ya está registrado",
  "Authorization code not found": "Código de autorización inválido o expirado",
  "Identity not found": "No se pudo identificar tu cuenta",
  "Token expired": "La sesión expiró, inicia sesión nuevamente",
  "Session expired": "La sesión expiró, inicia sesión nuevamente",
  "User disabled": "Esta cuenta está deshabilitada",
  "For security purposes, you can only request this after":
    "Por seguridad, espera unos segundos antes de volver a intentarlo",
  not_authenticated: "Debes iniciar sesión para acceder",
  owner_org_limit: "Ya tienes una organización asociada a tu cuenta",
  missing_fields: "Completa todos los campos requeridos",
  weak_password: "La contraseña debe tener al menos 8 caracteres",
  no_session: "No se pudo crear la sesión, intenta nuevamente",
  auth_callback_failed: "Error al iniciar sesión, intenta nuevamente",
  password_mismatch: "Las contraseñas no coinciden",
  missing_email: "Ingresa tu correo electrónico",
}

function translateError(errorMessage: string): string {
  if (SUPABASE_ERRORS_ES[errorMessage]) return SUPABASE_ERRORS_ES[errorMessage]
  if (errorMessage.includes("For security purposes"))
    return "Por seguridad, espera unos segundos antes de volver a intentarlo"
  if (errorMessage.includes("invalid")) return "Credenciales inválidas"
  if (errorMessage.includes("not found")) return "No encontrado"
  if (errorMessage.includes("expired")) return "Expirado"
  if (errorMessage.includes("disabled")) return "Deshabilitado"
  if (errorMessage.includes("missing")) return "Faltan campos requeridos"
  if (errorMessage.includes("weak")) return "Contraseña muy débil"
  return errorMessage
}

const OBJECTIVES = ["CRM", "Ventas", "WhatsApp automation", "Agendamiento", "Otro"] as const
type Objective = (typeof OBJECTIVES)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Helper: obtener el origin público correcto (funciona detrás de reverse proxy)
// ─────────────────────────────────────────────────────────────────────────────
function getOrigin(headerList: Awaited<ReturnType<typeof headers>>): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  const host = headerList.get("host")
  if (host) {
    const proto = headerList.get("x-forwarded-proto") ?? "https"
    return `${proto}://${host}`
  }
  return headerList.get("origin") ?? ""
}

// ─────────────────────────────────────────────────────────────────────────────
// signUpAction — registro con email + password
// ─────────────────────────────────────────────────────────────────────────────
export async function signUpAction(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim()
  const lastName = String(formData.get("lastName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const phone = String(formData.get("phone") ?? "").trim()
  const company = String(formData.get("company") ?? "").trim()

  if (!firstName || !lastName || !email || !company) {
    redirect("/auth?mode=signup&error=missing_fields")
  }
  if (password.length < 8) {
    redirect("/auth?mode=signup&error=weak_password")
  }

  const supabase = await createClient()
  const headerList = await headers()
  const origin = getOrigin(headerList)

  const selectedObjectives = (formData.getAll("objective") as string[]).filter((obj) =>
    OBJECTIVES.includes(obj as Objective),
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        company,
        objectives: selectedObjectives,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard/setup`,
    },
  })

  if (error) {
    redirect(`/auth?mode=signup&error=${encodeURIComponent(translateError(error.message))}`)
  }

  // Email ya registrado sin confirmar (Supabase reenvía silenciosamente)
  if (data.user && !data.session && data.user.identities?.length === 0) {
    redirect("/auth?mode=login&verify=1&resent=1")
  }

  // Sesión inmediata (autoconfirm activo) → crear organización + provisioning
  if (data.session && data.user) {
    const { error: orgError } = await supabase.rpc("create_my_organization", {
      p_name: company,
    })
    if (orgError) {
      // Si la org ya existe (owner_org_limit), continuar al setup
      if (!orgError.message.includes("owner_org_limit")) {
        redirect("/dashboard/setup?org_error=1")
      }
    }

    try {
      const { bootstrapWorkspace } = await import("@/lib/bootstrap-workspace")
      await bootstrapWorkspace({
        id: data.user.id,
        email,
        phone,
        fullName: `${firstName} ${lastName}`.trim(),
        company,
      })
    } catch {
      // Provisioning tolerante a fallos: el dashboard muestra el estado.
    }

    redirect("/dashboard/setup")
  }

  // Confirmación de email requerida
  redirect("/auth?mode=login&verify=1")
}

// ─────────────────────────────────────────────────────────────────────────────
// signInAction — login con email + password
// ─────────────────────────────────────────────────────────────────────────────
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "")

  if (!email || !password) {
    redirect("/auth?mode=login&error=missing_fields")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/auth?mode=login&error=${encodeURIComponent(translateError(error.message))}`)
  }

  if (!data.session) {
    redirect("/auth?mode=login&error=no_session")
  }

  // Asegurar que el usuario tenga organización
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id, bootstrap_status")
    .limit(1)

  if (!existingOrg?.length) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const company =
      (user?.user_metadata?.company as string | undefined) ?? email.split("@")[0]
    if (company) {
      await supabase.rpc("create_my_organization", { p_name: company })
    }
    redirect("/dashboard/setup")
  }

  // next explícito y seguro (ej: reset de contraseña)
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirect(next)
  }

  // Redirigir según estado del bootstrap
  const bootstrapStatus = existingOrg[0]?.bootstrap_status
  redirect(bootstrapStatus === "ready" ? "/dashboard" : "/dashboard/setup")
}

// ─────────────────────────────────────────────────────────────────────────────
// signOutAction — cierra sesión global
// ─────────────────────────────────────────────────────────────────────────────
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

// ─────────────────────────────────────────────────────────────────────────────
// signInWithGoogle — OAuth Google
// ─────────────────────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const supabase = await createClient()
  const headerList = await headers()
  const origin = getOrigin(headerList)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard/setup`,
      scopes: "email profile",
    },
  })

  if (error || !data.url) {
    redirect(
      `/auth?mode=login&error=${encodeURIComponent(
        error?.message ?? "No se pudo iniciar sesión con Google",
      )}`,
    )
  }

  redirect(data.url)
}

// ─────────────────────────────────────────────────────────────────────────────
// requestPasswordReset — envía email de recuperación
// ─────────────────────────────────────────────────────────────────────────────
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    redirect("/auth/forgot-password?error=missing_email")
  }

  const supabase = await createClient()
  const headerList = await headers()
  const origin = getOrigin(headerList)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    redirect(
      `/auth/forgot-password?error=${encodeURIComponent(translateError(error.message))}`,
    )
  }

  redirect("/auth/forgot-password?sent=1")
}

// ─────────────────────────────────────────────────────────────────────────────
// confirmPasswordReset — establece nueva contraseña
// ─────────────────────────────────────────────────────────────────────────────
export async function confirmPasswordReset(formData: FormData) {
  const newPassword = String(formData.get("newPassword") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (!newPassword || newPassword.length < 8) {
    redirect("/auth/reset-password?error=weak_password")
  }

  if (newPassword !== confirmPassword) {
    redirect("/auth/reset-password?error=password_mismatch")
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    redirect(
      `/auth/reset-password?error=${encodeURIComponent(translateError(error.message))}`,
    )
  }

  redirect("/auth?mode=login&verify=1")
}

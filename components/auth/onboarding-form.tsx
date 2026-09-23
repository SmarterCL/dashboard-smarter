"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Loader2, Globe, LogIn } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signInAction, signUpAction, signInWithGoogle } from "@/app/auth/actions"

const objectives = ["CRM", "Ventas", "WhatsApp automation", "Agendamiento", "Otro"]

type Mode = "login" | "signup"

export function OnboardingForm({
  initialMode = "signup",
  error,
  verify,
  resent,
}: {
  initialMode?: Mode
  error?: string
  verify?: boolean
  resent?: boolean
}) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [submitting, setSubmitting] = useState(false)

  async function handleAction(formData: FormData) {
    setSubmitting(true)
    try {
      if (mode === "login") {
        await signInAction(formData)
      } else {
        await signUpAction(formData)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100svh-4.25rem)] max-w-6xl items-start gap-8 px-4 py-8 md:grid-cols-[0.82fr_1.18fr] md:px-6 md:py-10 lg:gap-10">

      {/* ── Panel izquierdo ── */}
      <section className="flex flex-col justify-center md:sticky md:top-24 md:min-h-[calc(100svh-8rem)]">
        {mode === "signup" ? (
          <>
            <span className="w-fit rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              7 días gratis · sin tarjeta · sin compromisos
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Crea tu cuenta y activa tu CRM con WhatsApp
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Un único flujo: registro, onboarding, workspace y dashboard activo en menos de 1 minuto.
            </p>
            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <OnboardingBenefit text="Workspace CRM creado automáticamente." />
              <OnboardingBenefit text="WhatsApp preparado para conectar tu sesión." />
              <OnboardingBenefit text="Bandeja de atención lista en Chatwoot." />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Bienvenido de vuelta
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Entra a tu espacio de trabajo para continuar gestionando tus conversaciones y contactos.
            </p>
            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <OnboardingBenefit text="Tus conversaciones de WhatsApp y Gmail." />
              <OnboardingBenefit text="CRM con contactos y pipeline activo." />
              <OnboardingBenefit text="Bandeja unificada de tu equipo." />
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              ¿No tienes cuenta aún?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Prueba gratis
              </button>
            </p>
          </>
        )}
      </section>

      {/* ── Panel derecho: form ── */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Crear cuenta
          </button>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-foreground">
          {mode === "login" ? "Inicia sesión en SmarterCRM" : "Prueba la plataforma gratis"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Usa el email y la contraseña con los que creaste tu cuenta."
            : "Completa el registro para crear tu workspace."}
        </p>

        {/* Email pendiente de confirmación */}
        {verify ? (
          <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            {resent
              ? "Este email ya estaba registrado y pendiente de confirmación. Te reenviamos el email; revisa tu casilla y luego inicia sesión aquí."
              : "Te enviamos un email de confirmación. Verifica tu casilla y luego inicia sesión aquí."}
          </p>
        ) : null}

        {/* Error general */}
        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        ) : null}

        {/* Formulario */}
        <form action={handleAction} className="mt-6 space-y-5">
          {mode === "login" ? <LoginFields /> : <SignupFields />}

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {submitting
              ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              : mode === "login"
                ? <LogIn className="mr-2 h-5 w-5" />
                : <ArrowRight className="mr-2 h-5 w-5" />
            }
            {mode === "login" ? "Iniciar sesión" : "Empezar prueba gratis"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
          </div>
        </div>

        {/* Google OAuth */}
        <form action={signInWithGoogle}>
          <button
            type="submit"
            disabled={submitting}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full gap-2")}
          >
            <Globe className="h-5 w-5" />
            Continuar con Google
          </button>
        </form>

        {/* Forgot password — solo en login */}
        {mode === "login" && (
          <div className="mt-4 text-center">
            <a
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        )}
      </section>
    </div>
  )
}

function OnboardingBenefit({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  )
}

function LoginFields() {
  return (
    <>
      <TextField name="email" label="Email" type="email" placeholder="nombre@miempresa.com" required />
      <TextField name="password" label="Contraseña" type="password" placeholder="••••••••" required />
    </>
  )
}

function SignupFields() {
  return (
    <>
      <TextField name="firstName" label="Nombre" placeholder="Ej. María" required />
      <TextField name="email" label="Email" type="email" placeholder="nombre@miempresa.com" required />
      <TextField
        name="phone"
        label="Teléfono WhatsApp"
        type="tel"
        placeholder="+56 9 1234 5678"
        required
        hint="Lo usarás para conectar WhatsApp a tu CRM"
      />
      <TextField name="lastName" label="Apellido" placeholder="Ej. González" required />
      <TextField name="company" label="Empresa / negocio" placeholder="Ej. Mi Negocio SpA" required />
      <TextField
        name="password"
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        required
        minLength={8}
      />

      <fieldset>
        <legend className="text-sm font-medium text-foreground">¿Para qué usarás SmarterCRM?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {objectives.map((objective) => (
            <label
              key={objective}
              className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                name="objective"
                value={objective}
                type="checkbox"
                className="h-4 w-4 accent-primary"
              />
              {objective}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}

function TextField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  minLength,
  hint,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  hint?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
      />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

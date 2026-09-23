"use client"

import { useState } from "react"
import { Loader2, Mail } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { requestPasswordReset } from "@/app/auth/actions"

interface ForgotPasswordFormProps {
  error?: string
  sent?: boolean
}

export function ForgotPasswordForm({ error, sent }: ForgotPasswordFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      await requestPasswordReset(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {sent ? (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Correo enviado</h2>
          <p className="text-center text-sm text-muted-foreground">
            Te enviamos un enlace a <strong>{email || "tu correo"}</strong> para restablecer tu
            contraseña. Revisa tu bandeja de entrada (y spam).
          </p>
          <button
            type="button"
            onClick={() => (window.location.href = "/auth")}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Volver al login
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-foreground">Email registrado</span>
              <input
                name="email"
                type="email"
                required
                placeholder="nombre@miempresa.com"
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || !email}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Mail className="mr-2 h-5 w-5" />
              )}
              Enviar enlace de recuperación
            </button>
          </form>
        </>
      )}
    </>
  )
}

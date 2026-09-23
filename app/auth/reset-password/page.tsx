import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Restablece tu contraseña | SmarterOS",
  description: "Crea una nueva contraseña para tu cuenta.",
}

/**
 * /auth/reset-password — restablecimiento de contraseña (sistema CRM).
 *
 * Convive con /reset-password (sistema legacy del dashboard).
 * Este endpoint es el destino del link de recuperación enviado por email.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : undefined

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4">
          <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Restablece tu contraseña</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea una nueva contraseña para tu cuenta. Usa al menos 8 caracteres.
              </p>
            </div>
            <ResetPasswordForm error={error} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <a
              href="/auth"
              className="text-primary underline-offset-4 hover:underline"
            >
              ← Volver al login
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

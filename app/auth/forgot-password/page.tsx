import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "¿Olvidaste tu contraseña? | SmarterOS",
  description: "Recupera el acceso a tu cuenta de SmarterOS.",
}

/**
 * /auth/forgot-password — recuperación de contraseña (sistema CRM).
 *
 * Convive con /forgot-password (sistema legacy del dashboard).
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : undefined
  const sent = params.sent === "1"

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4">
          <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
              {!sent && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña.
                </p>
              )}
            </div>
            <ForgotPasswordForm error={error} sent={sent} />
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

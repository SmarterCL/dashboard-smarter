import type { Metadata } from "next"
import { OnboardingForm } from "@/components/auth/onboarding-form"

export const metadata: Metadata = {
  title: "Entrar o probar gratis | SmarterOS",
  description: "Login y prueba gratis de SmarterOS en un único flujo.",
}

/**
 * /auth — página unificada de login + signup del CRM.
 *
 * Convive con las páginas legacy /login y /register del dashboard.
 * Los flujos del CRM (onboarding, dashboard/setup) apuntan a /auth.
 * Los flujos legacy del dashboard siguen usando /login y /register.
 */
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string
    error?: string
    verify?: string
    resent?: string
  }>
}) {
  const params = await searchParams
  const initialMode = params.mode === "login" ? "login" : "signup"

  return (
    <div className="min-h-screen bg-background">
      <main>
        <OnboardingForm
          initialMode={initialMode}
          error={params.error ? decodeURIComponent(params.error) : undefined}
          verify={params.verify === "1"}
          resent={params.resent === "1"}
        />
      </main>
    </div>
  )
}

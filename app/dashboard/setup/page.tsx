import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DashboardClient, type DashboardProps } from "@/components/onboarding/dashboard-client"
import { ActivateButton } from "@/components/onboarding/activate-button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Activa tu espacio — SmarterOS",
}

/**
 * Estados de onboarding → ChannelStatus del componente UI.
 * El segundo argumento (bootstrapStatus) permite distinguir
 * un failed temprano (bootstrap aún no completó) de uno real.
 */
function toChannelStatus(
  raw: string | null | undefined,
  bootstrapStatus?: string | null,
): DashboardProps["chatwootStatus"] {
  if (raw === "ready") return "connected"
  if (raw === "failed" && bootstrapStatus !== "ready") return "pending"
  if (raw === "failed") return "failed"
  if (raw === "pending") return "pending"
  return "not_started"
}

function planLabel(planSlug: string | null, billingStatus: string | null): string {
  if (billingStatus === "trial" || planSlug === "trial") return "Trial gratuito"
  if (planSlug === "starter") return "Plan Starter"
  if (planSlug === "pro") return "Plan Pro"
  return "Plan activo"
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "long",
      timeZone: "America/Santiago",
    }).format(new Date(value))
  } catch {
    return value
  }
}

type OrgRow = {
  id: string
  name: string | null
  slug: string | null
  plan_slug: string | null
  billing_status: string | null
  bootstrap_status: string | null
  chatwoot_status: string | null
  chatwoot_onboarding_done: boolean | null
  waha_status: string | null
  waha_session_id: string | null
  trial_ends_at: string | null
  gmail_connected: boolean | null
  gmail_email: string | null
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{
    gmail_connected?: string
    gmail_error?: string
    chatwoot_onboarding?: string
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  const { data: orgs } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, plan_slug, billing_status, " +
      "bootstrap_status, chatwoot_status, chatwoot_onboarding_done, " +
      "waha_status, waha_session_id, trial_ends_at, gmail_connected, gmail_email",
    )
    .order("created_at", { ascending: true })
    .limit(1)

  const org = (orgs as OrgRow[] | null)?.[0] ?? null

  // Bootstrap completo → centro operativo
  if (org?.bootstrap_status === "ready") redirect("/dashboard")

  // Edge case: org aún no existe (llegó muy rápido antes de que se creara)
  if (!org) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Preparando tu espacio…</h1>
        <p className="mt-3 text-muted-foreground">
          Tu cuenta está activa. Activa tu espacio de trabajo para comenzar.
        </p>
        <ActivateButton />
      </main>
    )
  }

  const params = await searchParams
  const gmailJustConnected = params.gmail_connected === "1"
  const gmailError = params.gmail_error
  const chatwootOnboardingJustDone = params.chatwoot_onboarding === "done"

  const chatwootBase = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? ""
  const chatwootAccountId =
    process.env.NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID ?? process.env.CHATWOOT_ACCOUNT_ID ?? ""

  const setupProps: DashboardProps = {
    orgName: org.name ?? org.slug ?? "Mi empresa",
    userEmail: user.email ?? "",
    planLabel: planLabel(org.plan_slug, org.billing_status),
    chatwootStatus: toChannelStatus(org.chatwoot_status, org.bootstrap_status),
    chatwootOnboardingDone: chatwootOnboardingJustDone || Boolean(org.chatwoot_onboarding_done),
    chatwootAppUrl:
      chatwootBase && chatwootAccountId
        ? `${chatwootBase}/app/accounts/${chatwootAccountId}`
        : null,
    wahaStatus: toChannelStatus(org.waha_status, org.bootstrap_status),
    // waha_session_id es el identificador de sesión multi-tenant.
    // El frontend lo usa para construir: qr.smarterbot.store/{session}
    // No es un secreto — el QR es de acceso público dado el session_id.
    wahaSessionId: org.waha_session_id,
    gmailConnected: gmailJustConnected || Boolean(org.gmail_connected),
    gmailEmail: org.gmail_email ?? null,
    crmStatus: toChannelStatus(org.bootstrap_status, org.bootstrap_status),
    trialEndsAt: formatDate(org.trial_ends_at),
    bootstrapReady: org.bootstrap_status === "ready",
  }

  return (
    <>
      {gmailJustConnected && (
        <div className="sticky top-0 z-40 w-full bg-green-600 px-4 py-2 text-center text-sm font-medium text-white">
          ✓ Gmail conectado correctamente
        </div>
      )}
      {chatwootOnboardingJustDone && (
        <div className="sticky top-0 z-40 w-full bg-green-600 px-4 py-2 text-center text-sm font-medium text-white">
          ✓ Bandeja configurada. Continúa con el siguiente paso.
        </div>
      )}
      {gmailError && (
        <div className="sticky top-0 z-40 w-full bg-destructive px-4 py-2 text-center text-sm font-medium text-white">
          No se pudo conectar Gmail: {gmailError.replace(/_/g, " ")}
        </div>
      )}
      <DashboardClient {...setupProps} />
    </>
  )
}

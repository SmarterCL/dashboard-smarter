import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { signOutAction } from "@/app/auth/actions"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Smartphone,
  Mail,
  ExternalLink,
  Users,
  LogOut,
  CheckCircle2,
} from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dashboard — SmarterOS",
}

/**
 * /dashboard — Centro operativo del CRM.
 *
 * Solo accesible cuando bootstrap_status = "ready".
 * Si el setup está incompleto → redirige a /dashboard/setup.
 *
 * Coexiste con app/page.tsx (ruta "/") que es el dashboard legacy
 * del proyecto dashboard-smarter. No reemplaza esa ruta.
 */

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ chatwoot_onboarding?: string; gmail_connected?: string }>
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

  if (!org) redirect("/dashboard/setup")
  if (org.bootstrap_status !== "ready") redirect("/dashboard/setup")

  const chatwootBase = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? ""
  const chatwootAccountId =
    process.env.NEXT_PUBLIC_CHATWOOT_ACCOUNT_ID ?? process.env.CHATWOOT_ACCOUNT_ID ?? ""
  const chatwootAppUrl =
    chatwootBase && chatwootAccountId
      ? `${chatwootBase}/app/accounts/${chatwootAccountId}`
      : null

  const params = await searchParams
  const chatwootOnboardingJustDone = params.chatwoot_onboarding === "done"
  const gmailJustConnected = params.gmail_connected === "1"

  const isGmailConnected = gmailJustConnected || Boolean(org.gmail_connected)
  const isWahaConnected = org.waha_status === "ready"
  const isChatwootOnboarded = chatwootOnboardingJustDone || Boolean(org.chatwoot_onboarding_done)

  const qrBaseUrl = process.env.WAHA_QR_BASE_URL ?? "https://qr.smarterbot.store"
  const wahaQrUrl = org.waha_session_id
    ? `${qrBaseUrl}/${encodeURIComponent(org.waha_session_id)}`
    : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">

      {/* Banners de confirmación de acciones recientes */}
      {chatwootOnboardingJustDone && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
          ✓ Bandeja configurada correctamente.
        </div>
      )}
      {gmailJustConnected && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
          ✓ Gmail conectado correctamente.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {planLabel(org.plan_slug, org.billing_status)}
            {org.trial_ends_at && (
              <span className="ml-2 font-normal normal-case text-muted-foreground">
                · vence {formatDate(org.trial_ends_at)}
              </span>
            )}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {org.name ?? org.slug ?? "Mi empresa"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Acciones rápidas */}
      <section className="mt-8 flex flex-wrap gap-3">
        {chatwootAppUrl && (
          <a
            href={chatwootAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir bandeja
          </a>
        )}
        {!isChatwootOnboarded && chatwootAppUrl && (
          <a
            href={`${chatwootBase}/app/accounts/${chatwootAccountId}/onboarding`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            Completar configuración de bandeja
          </a>
        )}
      </section>

      {/* Canales */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Canales
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OperativeCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Bandeja"
            status="connected"
            detail={isChatwootOnboarded ? "Configurada" : "Activa — configuración pendiente"}
            href={chatwootAppUrl ?? undefined}
            hrefLabel="Abrir"
          />
          <OperativeCard
            icon={<Smartphone className="h-5 w-5" />}
            title="WhatsApp"
            status={isWahaConnected ? "connected" : "pending"}
            detail={isWahaConnected ? "Conectado" : "Pendiente de conexión"}
            href={isWahaConnected ? undefined : (wahaQrUrl ?? "/dashboard/setup")}
            hrefLabel={isWahaConnected ? undefined : "Conectar"}
            hrefExternal={isWahaConnected ? false : Boolean(wahaQrUrl)}
          />
          <OperativeCard
            icon={<Mail className="h-5 w-5" />}
            title="Gmail"
            status={isGmailConnected ? "connected" : "pending"}
            detail={isGmailConnected ? (org.gmail_email ?? "Conectado") : "No conectado"}
            href={isGmailConnected ? undefined : "/api/gmail/connect"}
            hrefLabel="Conectar"
          />
        </div>
      </section>

      {/* Equipo */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Equipo</h3>
              <p className="text-xs text-muted-foreground">Invita agentes a tu espacio de trabajo</p>
            </div>
          </div>
          <span className="text-xs italic text-muted-foreground">Próximamente</span>
        </div>
      </section>

      {/* Canales pendientes */}
      {(!isWahaConnected || !isGmailConnected || !isChatwootOnboarded) && (
        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Tienes canales sin configurar
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            Completa la configuración de tu espacio para aprovechar todas las funcionalidades.
          </p>
          <a href="/dashboard/setup" className={cn(buttonVariants({ size: "sm" }), "mt-3")}>
            Continuar configuración
          </a>
        </section>
      )}
    </main>
  )
}

function OperativeCard({
  icon,
  title,
  status,
  detail,
  href,
  hrefLabel,
  hrefExternal = false,
}: {
  icon: React.ReactNode
  title: string
  status: "connected" | "pending"
  detail: string
  href?: string
  hrefLabel?: string
  hrefExternal?: boolean
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {status === "connected" ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Activo
          </span>
        ) : (
          <span className="text-xs font-medium text-amber-500">Pendiente</span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
      {href && hrefLabel && (
        <a
          href={href}
          target={hrefExternal ? "_blank" : undefined}
          rel={hrefExternal ? "noopener noreferrer" : undefined}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
        >
          {hrefLabel}
        </a>
      )}
    </article>
  )
}

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Smartphone,
  Mail,
  LayoutDashboard,
  Users,
  ExternalLink,
  LogOut,
  ArrowRight,
} from "lucide-react"
import { WhatsAppConnectModal } from "@/components/onboarding/whatsapp-connect-modal"
import { ChannelCard, type ChannelStatus } from "@/components/onboarding/channel-card"
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/app/auth/actions"

export interface DashboardProps {
  orgName: string
  userEmail: string
  planLabel: string
  // Chatwoot
  chatwootStatus: ChannelStatus
  chatwootOnboardingDone: boolean
  chatwootAppUrl: string | null
  // WhatsApp
  wahaStatus: ChannelStatus
  wahaPhone?: string
  /** ID de sesión WAHA para construir la URL del QR externo */
  wahaSessionId?: string | null
  // Gmail
  gmailConnected: boolean
  gmailEmail?: string | null
  // CRM / estado general
  crmStatus: ChannelStatus
  trialEndsAt?: string | null
  bootstrapReady: boolean
}

function toChannelStatus(raw: string | null | undefined): ChannelStatus {
  if (raw === "ready") return "connected"
  if (raw === "failed") return "failed"
  if (raw === "pending") return "pending"
  return "not_started"
}

export function DashboardClient(props: DashboardProps) {
  const router = useRouter()
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [crmActivating, setCrmActivating] = useState(false)

  const [chatwootStatus, setChatwootStatus] = useState<ChannelStatus>(props.chatwootStatus)
  const [chatwootOnboardingDone, setChatwootOnboardingDone] = useState(props.chatwootOnboardingDone)
  const [wahaStatus, setWahaStatus] = useState<ChannelStatus>(props.wahaStatus)
  const [wahaPhone, setWahaPhone] = useState(props.wahaPhone)
  const [gmailConnected, setGmailConnected] = useState(props.gmailConnected)
  const [crmStatus, setCrmStatus] = useState<ChannelStatus>(props.crmStatus)

  const chatwootFullyReady = chatwootStatus === "connected" && chatwootOnboardingDone

  // Progreso: 4 pasos
  const steps: boolean[] = [
    chatwootFullyReady,
    wahaStatus === "connected",
    gmailConnected,
    crmStatus === "connected",
  ]
  const completed = steps.filter(Boolean).length
  const total = steps.length

  const nextAction = (() => {
    if (!chatwootFullyReady) {
      if (chatwootStatus !== "connected") return "activate_chat"
      return "chatwoot_onboarding"
    }
    if (wahaStatus !== "connected") return "whatsapp"
    if (!gmailConnected) return "gmail"
    if (crmStatus !== "connected") return "crm"
    return "done"
  })()

  // ── Acciones ──

  const activateChat = useCallback(async () => {
    setCrmActivating(true)
    try {
      const res = await fetch("/api/onboarding/activate", { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        const newChatwootStatus = toChannelStatus(data.organization?.chatwoot_status)
        const newWahaStatus = toChannelStatus(data.organization?.waha_status)
        setChatwootStatus(newChatwootStatus)
        setCrmStatus(toChannelStatus(data.organization?.bootstrap_status))
        setWahaStatus(newWahaStatus)
        if (newChatwootStatus === "connected") {
          await openChatwootOnboarding()
        }
      }
    } catch {
      setChatwootStatus("failed")
    } finally {
      setCrmActivating(false)
    }
  }, [])

  const openChatwootOnboarding = useCallback(async () => {
    const res = await fetch("/api/chatwoot/onboarding-url")
    if (!res.ok) return
    const data: { url: string; returnTo: string; alreadyDone: boolean } = await res.json()
    if (data.alreadyDone) {
      setChatwootOnboardingDone(true)
      return
    }
    window.location.href = data.url
  }, [])

  const activateCrm = useCallback(async () => {
    setCrmActivating(true)
    try {
      const res = await fetch("/api/onboarding/activate", { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        setCrmStatus(toChannelStatus(data.organization?.bootstrap_status))
        setChatwootStatus(toChannelStatus(data.organization?.chatwoot_status))
        setWahaStatus(toChannelStatus(data.organization?.waha_status))
      }
    } catch {
      setCrmStatus("failed")
    } finally {
      setCrmActivating(false)
    }
  }, [])

  const onWhatsAppConnected = useCallback((phone?: string) => {
    setWahaStatus("connected")
    setWahaPhone(phone)
    setWhatsappOpen(false)
    router.refresh()
  }, [router])

  const onGmailConnect = useCallback(() => {
    window.location.href = "/api/gmail/connect"
  }, [])

  const openChatwootApp = useCallback(() => {
    if (props.chatwootAppUrl) window.open(props.chatwootAppUrl, "_blank", "noopener,noreferrer")
  }, [props.chatwootAppUrl])

  return (
    <>
      <WhatsAppConnectModal
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        onConnected={onWhatsAppConnected}
        wahaSessionId={props.wahaSessionId}
      />

      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              {props.planLabel}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Bienvenido, {props.orgName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{props.userEmail}</p>
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

        {/* Progreso */}
        <section className="mt-8">
          <OnboardingProgress completed={completed} total={total} />
        </section>

        {/* Próxima acción */}
        {nextAction !== "done" && (
          <section className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Próxima acción</p>

            {nextAction === "activate_chat" && (
              <>
                <p className="mt-1 text-sm font-medium text-foreground">Activa tu bandeja de atención</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea tu cuenta en la bandeja para empezar a recibir y gestionar conversaciones.
                </p>
                <button
                  type="button"
                  onClick={activateChat}
                  disabled={crmActivating}
                  className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                >
                  {crmActivating ? "Activando…" : "Activar bandeja"}
                </button>
              </>
            )}

            {nextAction === "chatwoot_onboarding" && (
              <>
                <p className="mt-1 text-sm font-medium text-foreground">Configura tu bandeja</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completa la configuración inicial: nombre, empresa, idioma y zona horaria.
                </p>
                <button
                  type="button"
                  onClick={openChatwootOnboarding}
                  className={cn(buttonVariants({ size: "sm" }), "mt-3 gap-2")}
                >
                  <ArrowRight className="h-4 w-4" />
                  Configurar bandeja
                </button>
              </>
            )}

            {nextAction === "whatsapp" && (
              <>
                <p className="mt-1 text-sm font-medium text-foreground">Conecta WhatsApp</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escanea el QR con tu teléfono para empezar a recibir conversaciones de WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => setWhatsappOpen(true)}
                  className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                >
                  Conectar WhatsApp
                </button>
              </>
            )}

            {nextAction === "gmail" && (
              <>
                <p className="mt-1 text-sm font-medium text-foreground">Conecta Gmail</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Autoriza tu cuenta de Gmail para leer y responder correos desde SmarterCRM.
                </p>
                <button
                  type="button"
                  onClick={onGmailConnect}
                  className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                >
                  Conectar Gmail
                </button>
              </>
            )}

            {nextAction === "crm" && (
              <>
                <p className="mt-1 text-sm font-medium text-foreground">Activa tu CRM</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Inicializa tu espacio de trabajo completo para gestionar contactos y conversaciones.
                </p>
                <button
                  type="button"
                  onClick={activateCrm}
                  disabled={crmActivating}
                  className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                >
                  Activar CRM
                </button>
              </>
            )}
          </section>
        )}

        {/* Canales */}
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Canales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChannelCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="Bandeja de atención"
              description="Gestiona conversaciones de WhatsApp, Gmail y más"
              status={chatwootFullyReady ? "connected" : chatwootStatus === "connected" ? "pending" : chatwootStatus}
              connectedLabel={chatwootFullyReady ? "Activa" : undefined}
              ctaLabel={
                chatwootStatus !== "connected"
                  ? chatwootStatus === "failed" ? "Reintentar activación" : "Activar bandeja"
                  : "Completar configuración"
              }
              loading={crmActivating}
              onAction={chatwootStatus !== "connected" ? activateChat : openChatwootOnboarding}
            />
            <ChannelCard
              icon={<Smartphone className="h-5 w-5" />}
              title="WhatsApp"
              description="Recibe y responde mensajes de WhatsApp"
              status={wahaStatus}
              connectedLabel={wahaPhone}
              ctaLabel={wahaStatus === "failed" ? "Reintentar" : "Conectar WhatsApp"}
              onAction={() => setWhatsappOpen(true)}
            />
            <ChannelCard
              icon={<Mail className="h-5 w-5" />}
              title="Gmail"
              description="Lee y responde correos desde SmarterCRM"
              status={gmailConnected ? "connected" : "not_started"}
              connectedLabel={props.gmailEmail ?? undefined}
              ctaLabel="Conectar Gmail"
              onAction={onGmailConnect}
            />
            <ChannelCard
              icon={<LayoutDashboard className="h-5 w-5" />}
              title="CRM"
              description={
                props.trialEndsAt
                  ? `Trial activo · vence ${props.trialEndsAt}`
                  : "Contactos, pipelines y actividad comercial"
              }
              status={crmStatus}
              ctaLabel={crmStatus === "failed" ? "Reintentar activación" : "Activar CRM"}
              loading={crmActivating}
              onAction={activateCrm}
            />
          </div>
        </section>

        {/* Acceso rápido cuando la bandeja está lista */}
        {chatwootFullyReady && props.chatwootAppUrl && (
          <section className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Acceso rápido</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openChatwootApp}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir bandeja
              </button>
            </div>
          </section>
        )}

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

        {props.planLabel === "Trial gratuito" && props.trialEndsAt && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Tu periodo de prueba vence el {props.trialEndsAt}. Escríbenos para activar tu plan.
          </p>
        )}
      </main>
    </>
  )
}

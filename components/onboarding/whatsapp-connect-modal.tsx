"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CheckCircle2, Loader2, RefreshCw, Smartphone, X, ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type WahaStatus =
  | "scan_qr"
  | "working"
  | "starting"
  | "failed"
  | "stopped"
  | "no_session"
  | "not_configured"
  | null

/**
 * Estados de onboarding de WhatsApp.
 * Distingue explícitamente QR mostrado de conexión real.
 */
type OnboardingState =
  | "pending"       // inicial, sin acción tomada
  | "qr_required"   // sesión lista, esperando escaneo del QR
  | "connecting"    // QR escaneado, verificando conexión
  | "connected"     // WAHA status = working
  | "error"         // fallo de sesión

const POLL_INTERVAL_MS = 4_000 // polling cada 4s — conforme a instrucciones

/**
 * URL base del servidor QR externo (infraestructura existente).
 * NO se genera QR base64 desde Next.js.
 * El QR visual vive en qr.smarterbot.store/{waha_session_id}.
 */
const QR_BASE_URL =
  typeof window !== "undefined"
    ? ((window as typeof window & { __ENV__?: { WAHA_QR_BASE_URL?: string } }).__ENV__?.WAHA_QR_BASE_URL ?? "https://qr.smarterbot.store")
    : "https://qr.smarterbot.store"

interface Props {
  open: boolean
  onClose: () => void
  /** ID de sesión WAHA de la organización (obtenido del server component) */
  wahaSessionId?: string | null
  /** Llamado cuando WhatsApp queda conectado */
  onConnected: (phone?: string) => void
}

export function WhatsAppConnectModal({ open, onClose, onConnected, wahaSessionId }: Props) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>("pending")
  const [wahaStatus, setWahaStatus] = useState<WahaStatus>(null)
  const [connectedPhone, setConnectedPhone] = useState<string | undefined>()
  const [activating, setActivating] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // URL del QR externo — infraestructura existente, no se duplica
  const qrUrl = wahaSessionId
    ? `https://qr.smarterbot.store/${encodeURIComponent(wahaSessionId)}`
    : null

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
  }, [])

  const resetAll = useCallback(() => {
    stopPolling()
    setOnboardingState("pending")
    setWahaStatus(null)
    setConnectedPhone(undefined)
    setActivating(false)
  }, [stopPolling])

  // Asegura que la sesión WAHA exista antes de mostrar el QR
  const activateIfNeeded = useCallback(async () => {
    setActivating(true)
    try {
      await fetch("/api/onboarding/activate", { method: "POST" })
    } catch {
      // No bloqueante — el polling detectará el estado real
    } finally {
      setActivating(false)
    }
  }, [])

  // Polling a /api/waha/status — Next.js proxy al servidor WAHA (API key server-side)
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/waha/status", { cache: "no-store" })
      if (!res.ok) return
      const data: { status: WahaStatus; phone?: string } = await res.json()
      setWahaStatus(data.status)

      if (data.status === "working") {
        setConnectedPhone(data.phone)
        stopPolling()
        setOnboardingState("connected")
        onConnected(data.phone)
      } else if (data.status === "scan_qr") {
        setOnboardingState("qr_required")
      } else if (data.status === "starting") {
        setOnboardingState("connecting")
      } else if (data.status === "failed") {
        setOnboardingState("error")
        stopPolling()
      }
    } catch {
      // silencioso
    }
  }, [stopPolling, onConnected])

  const startPolling = useCallback(() => {
    fetchStatus()
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS)
  }, [fetchStatus])

  // Al abrir el modal: activar sesión y arrancar polling
  useEffect(() => {
    if (!open) {
      resetAll()
      return
    }
    activateIfNeeded().then(() => startPolling())
    // activateIfNeeded y startPolling son funciones estables (useCallback sin deps variables)
  }, [open, activateIfNeeded, startPolling, resetAll])

  // Cleanup al desmontar
  useEffect(() => () => stopPolling(), [stopPolling])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conectar WhatsApp"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground">Conectar WhatsApp</h2>

        {/* ── Activando sesión ── */}
        {activating && (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparando tu sesión de WhatsApp…</p>
          </div>
        )}

        {/* ── Esperando / QR requerido / conectando ── */}
        {!activating && (onboardingState === "pending" || onboardingState === "qr_required" || onboardingState === "connecting") && (
          <div className="mt-5 space-y-5">
            <p className="text-sm text-muted-foreground">
              {onboardingState === "connecting"
                ? "Detectando conexión con WhatsApp…"
                : "Escanea el código QR con tu teléfono para conectar WhatsApp a tu workspace."}
            </p>

            {/* Instrucciones */}
            <ol className="space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                Abre WhatsApp en tu teléfono
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                Toca los tres puntos (⋮) → <strong>Dispositivos vinculados</strong>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                Toca <strong>Vincular un dispositivo</strong>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                Escanea el código QR en la página que se abre
              </li>
            </ol>

            {/* Botón principal — abre qr.smarterbot.store/{session} en nueva pestaña */}
            {qrUrl ? (
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
              >
                <ExternalLink className="h-5 w-5" />
                Abrir código QR
              </a>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                La sesión WAHA aún no está asignada. Activa el workspace primero.
              </div>
            )}

            {/* Indicador de polling */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {onboardingState === "connecting"
                ? "Verificando conexión cada 4 segundos…"
                : "Esperando escaneo del QR…"}
            </div>

            {/* Botón refrescar */}
            <button
              type="button"
              onClick={() => { stopPolling(); startPolling() }}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2")}
            >
              <RefreshCw className="h-4 w-4" />
              Refrescar estado
            </button>
          </div>
        )}

        {/* ── Conectado ── */}
        {onboardingState === "connected" && (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <p className="text-lg font-semibold text-foreground">¡WhatsApp conectado!</p>
            {connectedPhone && (
              <p className="text-sm text-muted-foreground">
                Número: <strong>{connectedPhone}</strong>
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full")}
            >
              Listo
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {onboardingState === "error" && (
          <div className="mt-5 flex flex-col gap-3">
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-sm text-destructive">Hubo un error con la sesión de WhatsApp.</p>
            </div>
            <button
              type="button"
              onClick={() => { resetAll(); activateIfNeeded().then(() => startPolling()) }}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2")}
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        )}

        {/* Nota de sesión (debug/info — no expone API key) */}
        {wahaSessionId && onboardingState !== "connected" && (
          <p className="mt-4 text-center text-xs text-muted-foreground/60">
            <Smartphone className="mr-1 inline h-3 w-3" />
            Sesión: {wahaSessionId}
          </p>
        )}
      </div>
    </div>
  )
}

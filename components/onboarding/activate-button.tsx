"use client"

import { useState } from "react"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ActivateState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "done" }
  | { type: "partial"; warnings: string[] }
  | { type: "error"; message: string }

/**
 * Botón de activación de workspace para el edge case en que el usuario
 * llega al setup antes de que se haya creado la organización.
 *
 * Llama a /api/onboarding/activate y muestra el estado real:
 *   - Si las APIs no están configuradas: aviso claro (no queda en silencio).
 *   - Si el bootstrap quedó ready: recarga la página.
 */
export function ActivateButton() {
  const [state, setState] = useState<ActivateState>({ type: "idle" })

  async function activate() {
    setState({ type: "loading" })
    try {
      const res = await fetch("/api/onboarding/activate", { method: "POST" })
      const data = await res.json()

      if (!res.ok || (!data.ok && !data.alreadyBootstrapped)) {
        setState({ type: "error", message: data.error ?? "No se pudo activar el espacio. Intenta nuevamente." })
        return
      }

      const bootstrapStatus = data.organization?.bootstrap_status
      const warnings: string[] = data.organization?.warnings ?? []

      if (bootstrapStatus === "ready" || data.alreadyBootstrapped) {
        setState({ type: "done" })
        window.location.href = "/dashboard/setup"
        return
      }

      setState({ type: "partial", warnings })
    } catch {
      setState({ type: "error", message: "Error de conexión. Intenta nuevamente." })
    }
  }

  return (
    <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-4">
      {(state.type === "idle" || state.type === "loading") && (
        <button
          type="button"
          onClick={activate}
          disabled={state.type === "loading"}
          className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
        >
          {state.type === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
          {state.type === "loading" ? "Activando…" : "Activar espacio de trabajo"}
        </button>
      )}

      {state.type === "done" && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          Espacio activado correctamente
        </div>
      )}

      {state.type === "partial" && (
        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Espacio creado, servicios pendientes de configurar
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Tu cuenta está lista. Algunos servicios (bandeja, WhatsApp) necesitan
                configuración en el servidor para activarse.
              </p>
              {state.warnings.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {state.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-600 dark:text-amber-500">· {w}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => { window.location.href = "/dashboard/setup" }}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300")}
              >
                Continuar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

      {state.type === "error" && (
        <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">{state.message}</p>
              <button
                type="button"
                onClick={() => setState({ type: "idle" })}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

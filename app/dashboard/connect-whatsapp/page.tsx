"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, QrCode, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type WahaResponse = {
  waha: {
    sessionId: string
    status: string
    qr?: string | null
  }
  trial?: {
    isExpired: boolean
    daysRemaining: number
  }
}

function statusLabel(status?: string) {
  if (!status) return "unknown"
  if (status === "WORKING" || status === "working") return "working"
  if (status === "SCAN_QR") return "scan_qr"
  return status.toLowerCase()
}

export default function ConnectWhatsAppPage() {
  const [data, setData] = useState<WahaResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)

  async function loadSession() {
    setError(null)
    const response = await fetch("/api/waha/session", { cache: "no-store" })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "No se pudo cargar la sesión WAHA")
    }

    setData(payload)
  }

  async function startSession() {
    setIsStarting(true)
    setError(null)
    try {
      const response = await fetch("/api/waha/session", { method: "POST" })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo iniciar WAHA")
      }

      setData(payload)
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Error al iniciar WAHA")
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function boot() {
      setIsLoading(true)
      try {
        await loadSession()
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Error al cargar WAHA")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    boot()
    const interval = window.setInterval(() => {
      loadSession().catch(() => undefined)
    }, 5_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  const status = statusLabel(data?.waha.status)
  const isWorking = status === "working"

  return (
    <main className="min-h-screen bg-[#f6fbf7] p-6 text-[#123326]">
      <div className="mx-auto max-w-3xl">
        <Card className="border-[#cfe8d8] bg-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Conectar WhatsApp</CardTitle>
                <CardDescription>
                  Esta sesión WAHA está asociada al workspace activo. El QR nunca es global.
                </CardDescription>
              </div>
              {data?.trial && (
                <Badge className="bg-green-600">
                  {data.trial.isExpired ? "Trial expirado" : `${data.trial.daysRemaining} días`}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#5f756b]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando sesión WAHA
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[#cfe8d8] bg-[#f6fbf7] p-4">
                  <p className="text-sm text-[#5f756b]">Session ID</p>
                  <p className="mt-1 font-mono text-sm">{data?.waha.sessionId || "sin sesión"}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {isWorking ? (
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    ) : (
                      <QrCode className="h-5 w-5 text-[#5f756b]" />
                    )}
                    <span className="text-sm font-medium">Estado: {status}</span>
                  </div>
                </div>

                {data?.waha.qr ? (
                  <div className="rounded-lg border border-[#cfe8d8] bg-white p-4 text-center">
                    <img src={data.waha.qr} alt="QR de WhatsApp" className="mx-auto h-64 w-64 object-contain" />
                    <p className="mt-3 text-sm text-[#5f756b]">Escanea este QR con WhatsApp para conectar el workspace.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#cfe8d8] p-6 text-center text-sm text-[#5f756b]">
                    {isWorking ? "WhatsApp ya está conectado." : "Inicia o refresca la sesión para obtener el QR."}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={startSession} disabled={isStarting} className="bg-green-600 hover:bg-green-700">
                    {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                    Iniciar sesión
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLoading(true)
                      loadSession().finally(() => setIsLoading(false))
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refrescar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

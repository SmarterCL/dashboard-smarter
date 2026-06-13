"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function SeedDatabasePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeedDatabase = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/seed")

      // Verificar si la solicitud fue abortada
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult({ success: true, message: data.message })

      // Refrescar las rutas que dependen de los datos
      router.refresh()
    } catch (err) {
      setResult({ success: false, message: "Error al conectar con el servidor" })
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/" aria-label="Volver al dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Poblar Base de Datos</h1>
      </div>

      <Card className="bg-[#1e2a3b] border-[#2a3a4b] max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Datos de Ejemplo</CardTitle>
          <CardDescription className="text-gray-400">
            Ejecuta este script para poblar la base de datos con información de ejemplo para clientes, eventos, mensajes
            y estadísticas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">Este proceso creará:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            <li>5 clientes de ejemplo con diferentes estados</li>
            <li>Mensajes de WhatsApp entre clientes y el sistema</li>
            <li>Eventos en el calendario para los próximos días</li>
            <li>Estadísticas de rendimiento para los últimos 7 días</li>
          </ul>

          {result && (
            <Alert
              className={
                result.success
                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                  : "bg-red-500/20 text-red-400 border-red-500/50"
              }
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <div
                    className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    !
                  </div>
                )}
                <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {result.message}
                {error && <div className="mt-2 p-2 bg-red-500/10 rounded text-xs overflow-auto">{error}</div>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" className="border-[#2a3a4b]" asChild>
            <Link href="/">Cancelar</Link>
          </Button>
          <Button onClick={handleSeedDatabase} disabled={isLoading} className="gap-2" aria-busy={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Poblando base de datos...</span>
              </>
            ) : (
              "Poblar Base de Datos"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UpgradePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6fbf7] p-6 text-[#123326]">
      <Card className="w-full max-w-lg border-[#cfe8d8] bg-white">
        <CardHeader>
          <CardTitle>Trial finalizado</CardTitle>
          <CardDescription>
            Tu workspace SmarterOS completó los 7 días de prueba. Activa un plan para reabrir chat, WAHA y CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700">Actualizar plan</Button>
          <Button variant="outline" asChild>
            <Link href="/login">Cambiar cuenta</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

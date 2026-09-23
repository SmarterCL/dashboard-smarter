import type { Metadata } from "next"
import { ChatwootWidget } from "@/components/landing/chatwoot-widget"
import { WhatsAppFloat } from "@/components/landing/whatsapp-float"

export const metadata: Metadata = {
  title: "SmarterCRM — Consigue más clientes sin contratar más personal",
  description: "Crea tu cuenta y activa tu entorno CRM con WhatsApp en menos de 1 minuto.",
}

/**
 * Layout exclusivo de la landing page.
 *
 * Renderiza ChatwootWidget y WhatsAppFloat solo en este sub-árbol,
 * sin contaminar el layout raíz del dashboard.
 *
 * Nota: app/page.tsx (dashboard principal) tiene su propio layout heredado
 * del root layout. La landing vive en /landing para coexistir sin conflicto.
 * Cuando se quiera promover la landing a "/" bastará con mover este directorio
 * y actualizar la redirección de app/page.tsx.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatwootWidget />
      <WhatsAppFloat />
    </>
  )
}

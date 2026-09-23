import { SiteHeader } from "@/components/landing/site-header"
import { Hero } from "@/components/landing/hero"
import { Problems } from "@/components/landing/problems"
import { Solution } from "@/components/landing/solution"
import { Benefits } from "@/components/landing/benefits"
import { Process } from "@/components/landing/process"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"
import { StickyCta } from "@/components/landing/sticky-cta"

/**
 * /landing — landing page completa del CRM.
 *
 * Coexiste con la ruta "/" (dashboard principal del proyecto existente).
 * Para promover esta landing a "/" en el futuro:
 *   1. Renombrar app/landing/ → app/(landing)/  o reemplazar app/page.tsx
 *   2. Actualizar el middleware para redirigir "/" según auth
 *
 * ChatwootWidget y WhatsAppFloat se inyectan desde app/landing/layout.tsx.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 md:pb-0">
        <Hero />
        <Problems />
        <Solution />
        <Benefits />
        <Process />
        <FinalCta />
      </main>
      <SiteFooter />
      <StickyCta />
    </div>
  )
}

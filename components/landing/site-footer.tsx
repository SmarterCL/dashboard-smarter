import { WhatsAppIcon } from "@/components/landing/icons"

export function SiteFooter() {
  return (
    <footer className="bg-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center md:px-6">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-background">SmarterCRM</span>
        </div>
        <p className="mt-3 text-sm text-background/70">
          Sistema Operativo Comercial para Negocios Digitales
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-background/50">
          WhatsApp · CRM · Gmail · Google Calendar
        </p>
        <p className="mt-8 text-xs text-background/40">
          © {new Date().getFullYear()} SmarterCRM. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

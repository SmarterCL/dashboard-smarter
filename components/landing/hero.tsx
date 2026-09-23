import { ArrowRight, Calendar, Check, MessageSquare, KanbanSquare, LogIn, Mail } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { WhatsAppIcon } from "@/components/landing/icons"
import { cn } from "@/lib/utils"
import { LOGIN_URL, SIGNUP_URL } from "@/lib/contact"

const features = ["WhatsApp Business", "CRM de Contactos", "Gmail y Google Calendar", "Automatización Comercial"]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Sistema Operativo Comercial
          </span>
          <h1 className="mt-5 text-pretty text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
            Consigue más clientes sin contratar más personal
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Crea tu cuenta y activa tu entorno CRM con WhatsApp en menos de 1 minuto.
          </p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row">
            <a
              href={SIGNUP_URL}
              className={cn(buttonVariants({ size: "lg" }), "bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              PROBAR GRATIS
            </a>
            <a
              href={LOGIN_URL}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-primary/30 text-foreground hover:bg-accent")}
            >
              <LogIn className="mr-2 h-5 w-5 text-primary" />
              Entrar
            </a>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            7 días gratis sin tarjeta de crédito ni compromisos
          </p>
          <ul className="mt-8 grid w-full grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="grid gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">WhatsApp Business</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              En línea
            </span>
          </div>
          <div className="space-y-2">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">
              Hola, quiero más información 👋
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
              Listo. Activa tu CRM y conecta WhatsApp ahora.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <KanbanSquare className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">CRM Pipeline</span>
            </div>
            <div className="space-y-2">
              {[{ label: "Nuevo", w: "w-full" }, { label: "Contactado", w: "w-3/4" }, { label: "Reunión", w: "w-1/2" }].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted p-2">
                  <div className="text-[10px] font-medium text-muted-foreground">{s.label}</div>
                  <div className={`mt-1 h-1.5 rounded-full bg-primary ${s.w}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Calendar</span>
            </div>
            <div className="space-y-2">
              {["09:00 — Lead nuevo", "11:30 — Llamada", "15:00 — Seguimiento"].map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-lg border-l-2 border-primary bg-muted px-2 py-1.5 text-[11px] text-foreground">
                  {t}
                </div>
              ))}
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                <Mail className="h-3 w-3 text-primary" />
                Confirmación enviada por Gmail
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-accent/40 blur-2xl" />
      <span className="sr-only">
        <MessageSquare /> Flujos de automatización conectando WhatsApp, CRM y Google Calendar.
      </span>
    </div>
  )
}

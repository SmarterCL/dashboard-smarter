import { Bot, Users, CalendarCheck } from "lucide-react"
import { WhatsAppIcon } from "@/components/landing/icons"

const solutions = [
  {
    icon: WhatsAppIcon,
    title: "WhatsApp Business",
    description: "Responde automáticamente, captura oportunidades y atiende clientes 24/7.",
  },
  {
    icon: Users,
    title: "CRM Inteligente",
    description: "Organiza contactos, historial comercial y seguimiento en un solo lugar.",
  },
  {
    icon: CalendarCheck,
    title: "Google Calendar + Gmail",
    description: "Agenda reuniones automáticamente y envía confirmaciones por correo.",
  },
]

export function Solution() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Bot className="h-3.5 w-3.5" />
            Una sola plataforma
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tres herramientas. Un solo sistema.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {solutions.map((s) => (
            <div key={s.title} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

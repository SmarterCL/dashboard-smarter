import { MessageSquareReply, CalendarPlus, Repeat, Zap, Target, TrendingUp } from "lucide-react"

const benefits = [
  { icon: MessageSquareReply, label: "Más respuestas" },
  { icon: CalendarPlus, label: "Más reuniones" },
  { icon: Repeat, label: "Más seguimiento" },
  { icon: Zap, label: "Menos tareas manuales" },
  { icon: Target, label: "Más oportunidades" },
  { icon: TrendingUp, label: "Más ventas" },
]

export function Benefits() {
  return (
    <section className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Resultados que impactan tu negocio
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <b.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-foreground md:text-base">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

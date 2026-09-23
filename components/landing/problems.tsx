import { MoonStar, MessageCircleOff, CalendarX } from "lucide-react"

const problems = [
  {
    icon: MoonStar,
    title: "Pierdes clientes mientras duermes",
    description: "Nadie responde mensajes fuera de horario y las oportunidades se pierden.",
  },
  {
    icon: MessageCircleOff,
    title: "Conversaciones perdidas en el caos",
    description: "No sabes quién está interesado ni en qué etapa del proceso de compra se encuentra.",
  },
  {
    icon: CalendarX,
    title: "Agenda desordenada",
    description: "Confirmar reuniones manualmente consume tiempo y genera errores.",
  },
]

export function Problems() {
  return (
    <section className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          ¿Te identificas con alguno de estos problemas?
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {problems.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

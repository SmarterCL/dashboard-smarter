const steps = [
  "Cliente escribe por WhatsApp",
  "El sistema clasifica automáticamente el contacto",
  "Se registra en el CRM",
  "Se agenda una reunión",
  "Se envían confirmaciones automáticas",
  "Más clientes y más ventas",
]

export function Process() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="text-balance text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Cómo funciona
        </h2>
        <ol className="mt-10 space-y-4">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="pt-1 text-base font-medium leading-relaxed text-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

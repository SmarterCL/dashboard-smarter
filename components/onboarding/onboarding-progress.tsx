"use client"

interface Props {
  completed: number
  total: number
}

export function OnboardingProgress({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const allDone = completed === total

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {allDone ? "¡Espacio de trabajo listo!" : "Completa tu espacio de trabajo"}
        </span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completed} de {total} pasos completados
      </p>
    </div>
  )
}

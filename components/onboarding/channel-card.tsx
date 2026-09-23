"use client"

import { CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ChannelStatus = "connected" | "pending" | "failed" | "not_started"

interface ChannelCardProps {
  icon: React.ReactNode
  title: string
  description: string
  status: ChannelStatus
  connectedLabel?: string
  ctaLabel: string
  ctaDisabled?: boolean
  onAction: () => void
  loading?: boolean
}

const statusConfig: Record<ChannelStatus, { icon: React.ReactNode; color: string; label: string }> = {
  connected: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-600",
    label: "Conectado",
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "text-amber-500",
    label: "Pendiente",
  },
  failed: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-destructive",
    label: "Error — reintentar",
  },
  not_started: {
    icon: <Clock className="h-4 w-4" />,
    color: "text-muted-foreground",
    label: "Sin configurar",
  },
}

export function ChannelCard({
  icon,
  title,
  description,
  status,
  connectedLabel,
  ctaLabel,
  ctaDisabled,
  onAction,
  loading,
}: ChannelCardProps) {
  const s = statusConfig[status]

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className={cn("flex items-center gap-1 text-xs font-medium", s.color)}>
          {s.icon}
          {status === "connected" && connectedLabel ? connectedLabel : s.label}
        </span>
      </div>

      {status !== "connected" && (
        <button
          type="button"
          disabled={ctaDisabled || loading}
          onClick={onAction}
          className={cn(
            buttonVariants({ size: "sm" }),
            "w-full gap-2",
            status === "failed" && "bg-destructive hover:bg-destructive/90",
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {ctaLabel}
        </button>
      )}
    </article>
  )
}

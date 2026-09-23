"use client"

import { useState } from "react"
import { Loader2, Lock } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { confirmPasswordReset } from "@/app/auth/actions"

interface ResetPasswordFormProps {
  error?: string
}

export function ResetPasswordForm({ error }: ResetPasswordFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    try {
      await confirmPasswordReset(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Nueva contraseña</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres</p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Confirmar contraseña</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={submitting || !newPassword || !confirmPassword}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Lock className="mr-2 h-5 w-5" />
          )}
          Restablecer contraseña
        </button>
      </form>
    </>
  )
}

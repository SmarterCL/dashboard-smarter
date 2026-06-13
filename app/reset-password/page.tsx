"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase-client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1))
    const hasRecoveryToken = params.has("access_token") && params.get("type") === "recovery"

    if (!hasRecoveryToken) {
      setError("Enlace de restablecimiento de contraseña inválido o expirado.")
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess("Tu contraseña fue actualizada correctamente. Serás redirigido al inicio de sesión.")
      setTimeout(() => router.push("/login"), 2500)
    } catch {
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <Image src="/images/logo.png" alt="SmarterOS Logo" width={56} height={56} priority />
        </div>

        <h1 className="auth-title">Restablecer contraseña</h1>
        <p className="auth-subtitle">Ingresa una nueva contraseña para tu cuenta</p>

        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="reset-password" className="auth-label">
              Nueva contraseña
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="auth-input"
              disabled={!!success}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reset-confirm-password" className="auth-label">
              Confirmar nueva contraseña
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="auth-input"
              disabled={!!success}
            />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={isLoading || !!success}>
            {isLoading ? (
              <>
                <Loader2 className="auth-spinner-sm" />
                Actualizando...
              </>
            ) : (
              "Actualizar Contraseña"
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link href="/login" className="auth-link auth-back-link">
            <ArrowLeft size={14} />
            Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

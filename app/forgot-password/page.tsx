"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)
    try {
      const { error } = await resetPassword(email)
      if (error) { setError(error.message); return }
      setSuccess("¡Listo! Si ese correo está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.")
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

        <h1 className="auth-title">Recuperar contraseña</h1>
        <p className="auth-subtitle">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>

        {error && (
          <div className="auth-alert auth-alert-error" role="alert">{error}</div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success" role="alert">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="forgot-email" className="auth-label">Correo electrónico</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              disabled={!!success}
            />
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={isLoading || !!success}
          >
            {isLoading ? (
              <>
                <Loader2 className="auth-spinner-sm" />
                Enviando...
              </>
            ) : (
              "Enviar Enlace de Recuperación"
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link href="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft size={14} />
            Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

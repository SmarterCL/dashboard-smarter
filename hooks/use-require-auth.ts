"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function useRequireAuth(redirectTo = "/login") {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [user, isLoading, router, redirectTo])

  return { user, isLoading }
}

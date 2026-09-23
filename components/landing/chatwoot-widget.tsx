"use client"

import { useEffect } from "react"

/**
 * Widget de soporte Chatwoot para la landing page.
 * Se inyecta solo si NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN está configurado.
 * No renderizar en páginas de dashboard o auth.
 *
 * SEGURIDAD: WEBSITE_TOKEN es un identificador público (no un secreto).
 * Distinguir del CHATWOOT_API_TOKEN/ACCESS_TOKEN que son secretos server-side.
 */
declare global {
  interface Window {
    chatwootSettings?: {
      position: "left" | "right"
      type: "standard" | "expanded_bubble"
      launcherTitle: string
    }
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void
    }
  }
}

export function ChatwootWidget() {
  useEffect(() => {
    const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
    const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? "https://chat.smarterbot.store"

    if (!websiteToken || document.getElementById("chatwoot-sdk")) return

    window.chatwootSettings = {
      position: "right",
      type: "standard",
      launcherTitle: "Chatea con nosotros",
    }

    const script = document.createElement("script")
    script.id = "chatwoot-sdk"
    script.src = `${baseUrl}/packs/js/sdk.js`
    script.async = true
    script.defer = true
    script.onload = () => {
      window.chatwootSDK?.run({ websiteToken, baseUrl })
    }

    document.head.appendChild(script)
  }, [])

  return null
}

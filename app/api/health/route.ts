import { NextResponse } from "next/server"

/**
 * GET /api/health
 * Healthcheck para Docker / Caddy / monitoring.
 * Sin autenticación, sin datos sensibles.
 */
export function GET() {
  return NextResponse.json({ ok: true })
}

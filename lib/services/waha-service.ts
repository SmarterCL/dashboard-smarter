import { type Workspace, updateWorkspaceOperationalFields } from "@/lib/services/workspace-service"

export type WahaSessionStatus = {
  sessionId: string
  status:
    | "missing_config"
    | "reserved"
    | "starting"
    | "working"
    | "failed"
    | "unknown"
    | "WORKING"
    | "SCAN_QR"
    | "STOPPED"
    | "STARTING"
  qr?: string | null
}

function wahaConfig() {
  const configuredPrefix = process.env.WAHA_SESSION_PREFIX
  return {
    baseUrl: process.env.WAHA_BASE_URL?.replace(/\/$/, "") || null,
    apiKey: process.env.WAHA_API_KEY || null,
    sessionPrefix: configuredPrefix === undefined ? "smarteros" : configuredPrefix,
  }
}

function wahaHeaders() {
  const { apiKey } = wahaConfig()
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { "X-Api-Key": apiKey } : {}),
  }
}

function buildSessionId(workspaceId: string) {
  const { sessionPrefix } = wahaConfig()
  if (sessionPrefix === "") {
    return "default"
  }

  return `${sessionPrefix}-${workspaceId}`
}

export async function getOrCreateWahaSession(workspace: Workspace): Promise<string> {
  if (workspace.waha_session_id) {
    return workspace.waha_session_id
  }

  const sessionId = buildSessionId(workspace.id)
  await updateWorkspaceOperationalFields(workspace.id, { waha_session_id: sessionId })
  return sessionId
}

export async function startWahaSession(workspace: Workspace): Promise<WahaSessionStatus> {
  const { baseUrl } = wahaConfig()
  const sessionId = await getOrCreateWahaSession(workspace)

  if (!baseUrl) {
    return { sessionId, status: "missing_config" }
  }

  try {
    const response = await fetch(`${baseUrl}/api/sessions/start`, {
      method: "POST",
      headers: wahaHeaders(),
      body: JSON.stringify({ name: sessionId }),
      cache: "no-store",
    })

    if (!response.ok && response.status !== 409) {
      return { sessionId, status: "failed" }
    }

    return { sessionId, status: "starting" }
  } catch {
    return { sessionId, status: "failed" }
  }
}

export async function getWahaSessionStatus(workspace: Workspace): Promise<WahaSessionStatus> {
  const { baseUrl } = wahaConfig()
  const sessionId = await getOrCreateWahaSession(workspace)

  if (!baseUrl) {
    return { sessionId, status: "missing_config" }
  }

  try {
    const response = await fetch(`${baseUrl}/api/sessions/${encodeURIComponent(sessionId)}`, {
      headers: wahaHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      return { sessionId, status: "reserved" }
    }

    const payload = await response.json()
    return {
      sessionId,
      status: payload.status || payload.engine?.state || "unknown",
      qr: payload.qr || null,
    }
  } catch {
    return { sessionId, status: "failed" }
  }
}

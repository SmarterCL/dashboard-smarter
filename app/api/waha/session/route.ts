import { NextResponse } from "next/server"
import { apiErrorResponse, getSmarterOSSession } from "@/lib/api/smarteros-session"
import { getWahaSessionStatus, startWahaSession } from "@/lib/services/waha-service"
import { bootstrapWorkspace } from "@/lib/services/bootstrap-workspace"

export async function GET() {
  try {
    const { user } = await getSmarterOSSession()
    const bootstrap = await bootstrapWorkspace(user)
    const waha = await getWahaSessionStatus(bootstrap.workspace)

    return NextResponse.json({ waha, workspace: bootstrap.workspace, trial: bootstrap.trial })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST() {
  try {
    const { user } = await getSmarterOSSession()
    const bootstrap = await bootstrapWorkspace(user)
    const waha = await startWahaSession(bootstrap.workspace)

    return NextResponse.json({ waha, workspace: bootstrap.workspace, trial: bootstrap.trial })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

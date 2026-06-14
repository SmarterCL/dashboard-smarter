import { NextResponse } from "next/server"
import { apiErrorResponse, getSmarterOSSession } from "@/lib/api/smarteros-session"
import { getWahaSessionStatus, startWahaSession } from "@/lib/services/waha-service"

export async function GET() {
  try {
    const { workspace, trial } = await getSmarterOSSession()
    const waha = await getWahaSessionStatus(workspace)

    return NextResponse.json({ waha, workspace, trial })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST() {
  try {
    const { workspace, trial } = await getSmarterOSSession()
    const waha = await startWahaSession(workspace)

    return NextResponse.json({ waha, workspace, trial })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

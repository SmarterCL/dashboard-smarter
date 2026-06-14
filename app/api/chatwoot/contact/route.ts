import { NextResponse } from "next/server"
import { apiErrorResponse, getSmarterOSSession } from "@/lib/api/smarteros-session"
import { bootstrapWorkspace } from "@/lib/services/bootstrap-workspace"

export async function GET() {
  try {
    const { user } = await getSmarterOSSession()
    const bootstrap = await bootstrapWorkspace(user)

    return NextResponse.json(bootstrap)
  } catch (error) {
    return apiErrorResponse(error)
  }
}

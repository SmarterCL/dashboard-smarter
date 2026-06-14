import { NextResponse } from "next/server"
import { apiErrorResponse, getSmarterOSSession } from "@/lib/api/smarteros-session"
import { bootstrapWorkspace } from "@/lib/services/bootstrap-workspace"

export async function GET() {
  try {
    const { user } = await getSmarterOSSession()
    const bootstrap = await bootstrapWorkspace(user)

    return NextResponse.json({
      conversations: [bootstrap.conversation],
      activeConversation: bootstrap.conversation,
      contact: bootstrap.contact,
      workspace: bootstrap.workspace,
      trial: bootstrap.trial,
      waha: bootstrap.waha,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST() {
  return GET()
}

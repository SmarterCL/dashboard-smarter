import { NextResponse, type NextRequest } from "next/server"
import { getMessages, sendMessage } from "@/lib/services/chatwoot-service"
import { apiErrorResponse, getSmarterOSSession } from "@/lib/api/smarteros-session"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getSmarterOSSession()
    const { id } = await context.params
    const messages = await getMessages(id)

    return NextResponse.json({ messages })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await getSmarterOSSession()
    const { id } = await context.params
    const body = await request.json()
    const content = typeof body.content === "string" ? body.content.trim() : ""

    if (!content) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
    }

    const message = await sendMessage(id, content)
    return NextResponse.json({ message })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

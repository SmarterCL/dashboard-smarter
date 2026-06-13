import { createServerSupabaseClient } from "../supabase"

export type WhatsAppMessage = {
  id: string
  client_id: string
  direction: "incoming" | "outgoing"
  content: string
  status: string
  read: boolean
  created_at: string
}

export async function getWhatsAppMessages(limit = 10): Promise<WhatsAppMessage[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*, clients(name)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching WhatsApp messages:", error)
    throw error
  }

  return data || []
}

export async function getClientMessages(clientId: string): Promise<WhatsAppMessage[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error(`Error fetching messages for client ${clientId}:`, error)
    throw error
  }

  return data || []
}

export async function sendWhatsAppMessage(
  message: Omit<WhatsAppMessage, "id" | "created_at">,
): Promise<WhatsAppMessage> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("whatsapp_messages").insert([message]).select().single()

  if (error) {
    console.error("Error sending WhatsApp message:", error)
    throw error
  }

  return data
}

export async function markMessageAsRead(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("whatsapp_messages").update({ read: true }).eq("id", id)

  if (error) {
    console.error(`Error marking message ${id} as read:`, error)
    throw error
  }
}

import { createServerSupabaseClient } from "../supabase"

export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  last_interaction: string | null
  created_at: string
  updated_at: string
}

export async function getClients(): Promise<Client[]> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      throw new Error(`Error fetching clients: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getClients:", error)
    return [] // Retornar array vacío en lugar de propagar el error
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching client with id ${id}:`, error)
    return null
  }

  return data
}

export async function createClient(client: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("clients").insert([client]).select().single()

  if (error) {
    console.error("Error creating client:", error)
    throw error
  }

  return data
}

export async function updateClient(
  id: string,
  client: Partial<Omit<Client, "id" | "created_at" | "updated_at">>,
): Promise<Client> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("clients")
    .update({ ...client, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating client with id ${id}:`, error)
    throw error
  }

  return data
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting client with id ${id}:`, error)
    throw error
  }
}

import { createServerSupabaseClient } from "../supabase"

export type Deal = {
  id: string
  organization_id: string
  client_id: string
  title: string
  value: number
  currency: string
  stage: "lead" | "qualified" | "proposal" | "won" | "lost"
  probability: number | null
  expected_close_date: string | null
  owner_id: string | null
  created_at: string
  updated_at: string
}

export type DealNote = {
  id: string
  deal_id: string
  user_id: string | null
  content: string
  created_at: string
}

export async function getDeals(organizationId: string): Promise<Deal[]> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("deal")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching deals:", error)
      throw new Error(`Error fetching deals: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getDeals:", error)
    return []
  }
}

export async function getDealById(id: string): Promise<Deal | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("deal").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching deal with id ${id}:`, error)
    return null
  }

  return data
}

export async function createDeal(deal: Omit<Deal, "id" | "created_at" | "updated_at">): Promise<Deal> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("deal").insert([deal]).select().single()

  if (error) {
    console.error("Error creating deal:", error)
    throw error
  }

  return data
}

export async function updateDeal(
  id: string,
  deal: Partial<Omit<Deal, "id" | "created_at" | "updated_at">>,
): Promise<Deal> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("deal")
    .update({ ...deal, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating deal with id ${id}:`, error)
    throw error
  }

  return data
}

export async function deleteDeal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("deal").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting deal with id ${id}:`, error)
    throw error
  }
}

export async function getDealNotes(dealId: string): Promise<DealNote[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("deal_notes")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error(`Error fetching notes for deal ${dealId}:`, error)
    throw error
  }

  return data || []
}

export async function addDealNote(note: Omit<DealNote, "id" | "created_at">): Promise<DealNote> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("deal_notes").insert([note]).select().single()

  if (error) {
    console.error("Error adding deal note:", error)
    throw error
  }

  return data
}

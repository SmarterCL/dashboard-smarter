import { createServerSupabaseClient } from "../supabase"

export type Subscription = {
  id: string
  organization_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_tier: "free" | "pro" | "enterprise"
  status: "active" | "past_due" | "canceled" | "trialing"
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export async function getSubscriptionByOrganization(organizationId: string): Promise<Subscription | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("subscription")
    .select("*")
    .eq("organization_id", organizationId)
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 means no rows found, which might be normal
      console.error(`Error fetching subscription for organization ${organizationId}:`, error)
    }
    return null
  }

  return data
}

export async function createSubscription(
  subscription: Omit<Subscription, "id" | "created_at" | "updated_at">,
): Promise<Subscription> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("subscription").insert([subscription]).select().single()

  if (error) {
    console.error("Error creating subscription:", error)
    throw error
  }

  return data
}

export async function updateSubscription(
  id: string,
  updates: Partial<Omit<Subscription, "id" | "organization_id" | "created_at" | "updated_at">>,
): Promise<Subscription> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("subscription")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating subscription with id ${id}:`, error)
    throw error
  }

  return data
}

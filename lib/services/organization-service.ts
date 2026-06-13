import { createServerSupabaseClient } from "../supabase"

export type Organization = {
  id: string
  name: string
  slug: string
  billing_email: string | null
  created_at: string
  updated_at: string
}

export type OrganizationMember = {
  id: string
  organization_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  created_at: string
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select("organizations(*)")
    .eq("user_id", userId)

  if (error) {
    console.error(`Error fetching organizations for user ${userId}:`, error)
    return []
  }

  return data.map((item) => item.organizations) as unknown as Organization[]
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching organization with id ${id}:`, error)
    return null
  }

  return data
}

export async function createOrganization(
  org: Omit<Organization, "id" | "created_at" | "updated_at">,
  userId: string,
): Promise<Organization> {
  const supabase = createServerSupabaseClient()

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert([org])
    .select()
    .single()

  if (orgError) {
    console.error("Error creating organization:", orgError)
    throw orgError
  }

  // Auto-assign the creator as the owner
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert([
      {
        organization_id: organization.id,
        user_id: userId,
        role: "owner",
      },
    ])

  if (memberError) {
    console.error("Error assigning owner to organization:", memberError)
    // You might want to rollback the organization creation here depending on strictness
  }

  return organization
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)

  if (error) {
    console.error(`Error fetching members for organization ${organizationId}:`, error)
    return []
  }

  return data
}

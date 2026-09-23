import { createServerSupabaseClient } from "../supabase"

/**
 * Servicio de organizaciones — vista ligera para operaciones CRM legacy.
 *
 * Columnas eliminadas del tipo Organization (no existen en la BD):
 *   - billing_email → no persiste en este esquema
 *   - updated_at    → organizations no tiene updated_at
 *
 * Tabla corregida: memberships (era organization_members, que no existe en BD).
 * Columnas reales de memberships: id, org_id, user_id, role, invited_by, created_at.
 * Roles válidos: owner | admin | agent | viewer (según CHECK constraint en BD).
 */
export type Organization = {
  id: string
  name: string | null
  slug: string | null
  created_at: string
}

export type OrganizationMember = {
  id: string
  /** Columna real en memberships: org_id (era organization_id en el código legacy) */
  org_id: string
  user_id: string
  /** Roles válidos según CHECK en BD: owner | admin | agent | viewer */
  role: "owner" | "admin" | "agent" | "viewer"
  invited_by: string | null
  created_at: string
}

/**
 * Obtiene todas las organizaciones del usuario (via memberships).
 */
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("memberships")
    .select("organizations(id, name, slug, created_at)")
    .eq("user_id", userId)

  if (error) {
    console.error(`Error fetching organizations for user ${userId}:`, error)
    return []
  }

  return data
    .map((item) => item.organizations)
    .filter(Boolean) as unknown as Organization[]
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at")
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching organization with id ${id}:`, error)
    return null
  }

  return data
}

/**
 * Crea una organización e inserta la membership owner.
 *
 * Nota: el trigger organizations_owner_membership en Supabase ya crea
 * la membership automáticamente al insertar en organizations. Esta función
 * la inserta explícitamente también para compatibilidad con flujos que
 * no pasen por el RPC create_my_organization().
 * El INSERT usa ON CONFLICT DO NOTHING para ser idempotente con el trigger.
 */
export async function createOrganization(
  org: Pick<Organization, "name" | "slug">,
  userId: string,
): Promise<Organization> {
  const supabase = createServerSupabaseClient()

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert([{ ...org, owner_id: userId }])
    .select("id, name, slug, created_at")
    .single()

  if (orgError) {
    console.error("Error creating organization:", orgError)
    throw orgError
  }

  // El trigger organizations_owner_membership ya creó la fila en memberships.
  // Insertamos explícitamente con ON CONFLICT DO NOTHING para idempotencia.
  const { error: memberError } = await supabase.from("memberships").insert([
    {
      org_id: organization.id,
      user_id: userId,
      role: "owner",
    },
  ])

  if (memberError && memberError.code !== "23505") {
    // 23505 = unique_violation: ya existe la membership (trigger la creó antes)
    console.error("Error assigning owner membership to organization:", memberError)
  }

  return organization
}

/**
 * Obtiene los miembros de una organización desde la tabla memberships.
 */
export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("memberships")
    .select("id, org_id, user_id, role, invited_by, created_at")
    .eq("org_id", organizationId)

  if (error) {
    console.error(
      `Error fetching members for organization ${organizationId}:`,
      error,
    )
    return []
  }

  return data as OrganizationMember[]
}

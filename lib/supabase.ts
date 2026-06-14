import { createClient, type SupabaseClient } from "@supabase/supabase-js"

type SupabaseClientOptions = { required?: boolean }

// Creamos un cliente para el lado del servidor
export function createServerSupabaseClient(options: { required: false }): SupabaseClient | null
export function createServerSupabaseClient(options?: SupabaseClientOptions): SupabaseClient
export function createServerSupabaseClient(options?: SupabaseClientOptions) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (options?.required === false) {
      return null
    }

    throw new Error("Faltan las variables de entorno de Supabase")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

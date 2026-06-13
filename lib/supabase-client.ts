import { createBrowserClient } from "@supabase/ssr"

let clientSupabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createClientSupabaseClient = (options?: { required?: boolean }) => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (options?.required === false) {
      return null
    }

    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  clientSupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return clientSupabaseClient
}

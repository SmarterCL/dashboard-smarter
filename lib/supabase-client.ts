import { createBrowserClient } from "@supabase/ssr"

let clientSupabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan las variables de entorno de Supabase para el cliente")
  }

  clientSupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return clientSupabaseClient
}

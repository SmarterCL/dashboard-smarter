import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getOrCreateWorkspace, getTrialState, type TrialState, type Workspace } from "@/lib/services/workspace-service"

export type SmarterOSSession = {
  user: User
  workspace: Workspace
  trial: TrialState
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message)
  }
}

async function getSupabaseUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ApiError("Supabase no está configurado", 500)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError("No autorizado", 401)
  }

  return user
}

export async function getSmarterOSSession(options?: { requireActiveTrial?: boolean }): Promise<SmarterOSSession> {
  const user = await getSupabaseUser()
  const workspace = await getOrCreateWorkspace(user)
  const trial = getTrialState(user, workspace)

  if (options?.requireActiveTrial !== false && trial.isExpired) {
    throw new ApiError("Trial expirado", 402)
  }

  return { user, workspace, trial }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  console.error("API error:", error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Error interno del servidor" },
    { status: 500 },
  )
}

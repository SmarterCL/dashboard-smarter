type SupabaseErrorLike = {
  code?: string
  message?: string
}

export function isMissingTableError(error: unknown): error is SupabaseErrorLike {
  if (!error || typeof error !== "object") {
    return false
  }

  const supabaseError = error as SupabaseErrorLike

  return supabaseError.code === "PGRST205"
}

import { createServerSupabaseClient } from "../supabase"

export type Statistic = {
  id: string
  metric_name: string
  metric_value: number
  date_recorded: string
  created_at: string
}

export async function getStatistics(metricName: string, days = 7): Promise<Statistic[]> {
  const supabase = createServerSupabaseClient()

  // Calcular la fecha de inicio (hace X días)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("statistics")
    .select("*")
    .eq("metric_name", metricName)
    .gte("date_recorded", startDateStr)
    .order("date_recorded", { ascending: true })

  if (error) {
    console.error(`Error fetching statistics for ${metricName}:`, error)
    throw error
  }

  return data || []
}

export async function recordStatistic(statistic: Omit<Statistic, "id" | "created_at">): Promise<Statistic> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("statistics").insert([statistic]).select().single()

  if (error) {
    console.error("Error recording statistic:", error)
    throw error
  }

  return data
}

export async function getDailyStatistics(): Promise<any> {
  const supabase = createServerSupabaseClient()

  // Obtener estadísticas del día actual
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase.from("statistics").select("*").eq("date_recorded", today)

  if (error) {
    console.error("Error fetching daily statistics:", error)
    throw error
  }

  // Transformar los datos en un objeto más fácil de usar
  const stats: Record<string, number> = {}
  data?.forEach((stat) => {
    stats[stat.metric_name] = stat.metric_value
  })

  return stats
}

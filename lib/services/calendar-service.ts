import { createServerSupabaseClient } from "../supabase"

export type CalendarEvent = {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export type EventParticipant = {
  id: string
  event_id: string
  client_id: string | null
  email: string | null
  name: string | null
  status: string
  created_at: string
}

export async function getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .gte("start_time", startDate)
      .lte("end_time", endDate)
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching calendar events:", error)
      throw new Error(`Error fetching calendar events: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getCalendarEvents:", error)
    // En un entorno de producción, podríamos querer registrar este error en un servicio de monitoreo
    return [] // Retornar array vacío en lugar de propagar el error
  }
}

export async function getEventById(id: string): Promise<CalendarEvent | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("calendar_events").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching event with id ${id}:`, error)
    return null
  }

  return data
}

export async function createCalendarEvent(
  event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">,
): Promise<CalendarEvent> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("calendar_events").insert([event]).select().single()

  if (error) {
    console.error("Error creating calendar event:", error)
    throw error
  }

  return data
}

export async function updateCalendarEvent(
  id: string,
  event: Partial<Omit<CalendarEvent, "id" | "created_at" | "updated_at">>,
): Promise<CalendarEvent> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("calendar_events")
    .update({ ...event, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating event with id ${id}:`, error)
    throw error
  }

  return data
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("calendar_events").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting event with id ${id}:`, error)
    throw error
  }
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("event_participants")
    .select("*, clients(name, email)")
    .eq("event_id", eventId)

  if (error) {
    console.error(`Error fetching participants for event ${eventId}:`, error)
    throw error
  }

  return data || []
}

export async function addEventParticipant(
  participant: Omit<EventParticipant, "id" | "created_at">,
): Promise<EventParticipant> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("event_participants").insert([participant]).select().single()

  if (error) {
    console.error("Error adding event participant:", error)
    throw error
  }

  return data
}

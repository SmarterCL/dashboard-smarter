"use server"

import { createClient } from "@/lib/services/client-service"
import { createCalendarEvent, addEventParticipant } from "@/lib/services/calendar-service"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp-service"
import { recordStatistic } from "@/lib/services/statistics-service"

export async function seedDatabase() {
  try {
    // Crear clientes de ejemplo
    const client1 = await createClient({
      name: "Carlos Rodríguez",
      email: "carlos@ejemplo.com",
      phone: "+56 9 1234 5678",
      status: "active",
      last_interaction: new Date().toISOString(),
    })

    const client2 = await createClient({
      name: "María González",
      email: "maria@ejemplo.com",
      phone: "+56 9 8765 4321",
      status: "active",
      last_interaction: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
    })

    const client3 = await createClient({
      name: "Juan Pérez",
      email: "juan@ejemplo.com",
      phone: "+56 9 2468 1357",
      status: "inactive",
      last_interaction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
    })

    const client4 = await createClient({
      name: "Ana Silva",
      email: "ana@ejemplo.com",
      phone: "+56 9 1357 2468",
      status: "active",
      last_interaction: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Hace 3 horas
    })

    const client5 = await createClient({
      name: "Roberto Muñoz",
      email: "roberto@ejemplo.com",
      phone: "+56 9 9876 5432",
      status: "pending",
      last_interaction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
    })

    // Crear mensajes de WhatsApp de ejemplo
    await sendWhatsAppMessage({
      client_id: client1.id,
      direction: "incoming",
      content: "Hola, ¿podemos agendar una reunión para mañana?",
      status: "delivered",
      read: false,
    })

    await sendWhatsAppMessage({
      client_id: client2.id,
      direction: "incoming",
      content: "Necesito información sobre los precios del servicio",
      status: "delivered",
      read: true,
    })

    await sendWhatsAppMessage({
      client_id: client2.id,
      direction: "outgoing",
      content: "Claro, te envío el detalle de precios a continuación...",
      status: "delivered",
      read: true,
    })

    // Crear eventos de calendario de ejemplo
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()

    const event1 = await createCalendarEvent({
      title: "Reunión con Cliente",
      description: "Presentación de propuesta comercial",
      start_time: new Date(year, month, day, 10, 0, 0).toISOString(),
      end_time: new Date(year, month, day, 11, 0, 0).toISOString(),
      event_type: "meeting",
      created_by: "admin",
    })

    await addEventParticipant({
      event_id: event1.id,
      client_id: client1.id,
      email: null,
      name: null,
      status: "confirmed",
    })

    const event2 = await createCalendarEvent({
      title: "Llamada de seguimiento",
      description: "Seguimiento de proyecto en curso",
      start_time: new Date(year, month, day + 1, 14, 30, 0).toISOString(),
      end_time: new Date(year, month, day + 1, 15, 0, 0).toISOString(),
      event_type: "call",
      created_by: "admin",
    })

    await addEventParticipant({
      event_id: event2.id,
      client_id: client2.id,
      email: null,
      name: null,
      status: "pending",
    })

    const event3 = await createCalendarEvent({
      title: "Entrega de propuesta",
      description: "Finalizar y enviar propuesta comercial",
      start_time: new Date(year, month, day + 2, 9, 0, 0).toISOString(),
      end_time: new Date(year, month, day + 2, 10, 0, 0).toISOString(),
      event_type: "task",
      created_by: "admin",
    })

    // Crear estadísticas de ejemplo
    const today = new Date().toISOString().split("T")[0]

    await recordStatistic({
      metric_name: "messages_responded",
      metric_value: 24,
      date_recorded: today,
    })

    await recordStatistic({
      metric_name: "tasks_automated",
      metric_value: 12,
      date_recorded: today,
    })

    await recordStatistic({
      metric_name: "hours_saved",
      metric_value: 3.5,
      date_recorded: today,
    })

    await recordStatistic({
      metric_name: "response_rate",
      metric_value: 98.2,
      date_recorded: today,
    })

    // Estadísticas históricas para los últimos 7 días
    for (let i = 1; i <= 6; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      await recordStatistic({
        metric_name: "messages_responded",
        metric_value: Math.floor(Math.random() * 10) + 15, // Entre 15 y 25
        date_recorded: dateStr,
      })

      await recordStatistic({
        metric_name: "tasks_automated",
        metric_value: Math.floor(Math.random() * 5) + 8, // Entre 8 y 13
        date_recorded: dateStr,
      })

      await recordStatistic({
        metric_name: "hours_saved",
        metric_value: Math.floor(Math.random() * 20 + 20) / 10, // Entre 2.0 y 4.0
        date_recorded: dateStr,
      })
    }

    return { success: true, message: "Datos de ejemplo creados correctamente" }
  } catch (error) {
    console.error("Error al crear datos de ejemplo:", error)
    return { success: false, message: "Error al crear datos de ejemplo", error }
  }
}

import { Plus, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCalendarEvents } from "@/lib/services/calendar-service"
import Link from "next/link"

// Memoizar la generación de días del mes para evitar recálculos innecesarios
export const generateDaysOfMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return {
    days,
    firstDayOfWeek: firstDay.getDay(), // 0 = Sunday, 1 = Monday, etc.
    daysInMonth,
  }
}

// Función para formatear fecha
const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0]
}

export default async function CalendarioPage() {
  // Obtener fecha actual
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentDay = now.getDate()

  // Obtener días del mes actual
  const { days: dias, firstDayOfWeek: primerDiaSemana, daysInMonth: diasEnMes } = generateDaysOfMonth(year, month)

  // Obtener nombre del mes
  const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(now)

  // Calcular rango de fechas para obtener eventos
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  // Obtener eventos del mes
  const events = await getCalendarEvents(formatDate(startDate), formatDate(endDate))

  // Agrupar eventos por día
  const eventsByDay: Record<number, typeof events> = {}
  events.forEach((event) => {
    const eventDate = new Date(event.start_time)
    const day = eventDate.getDate()

    if (!eventsByDay[day]) {
      eventsByDay[day] = []
    }

    eventsByDay[day].push(event)
  })

  // Obtener eventos de hoy para la vista de agenda
  const today = formatDate(now)
  const tomorrow = formatDate(new Date(year, month, currentDay + 1))
  const dayAfterTomorrow = formatDate(new Date(year, month, currentDay + 2))

  const todayEvents = events.filter((e) => e.start_time.startsWith(today))
  const tomorrowEvents = events.filter((e) => e.start_time.startsWith(tomorrow))
  const dayAfterTomorrowEvents = events.filter((e) => e.start_time.startsWith(dayAfterTomorrow))

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-gray-400">Gestiona tus eventos y reuniones</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" asChild>
            <Link href="/calendario/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mes" className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList className="bg-[#1e2a3b]">
            <TabsTrigger value="dia">Día</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mes</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#2a3a4b]">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-medium">
              {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} {year}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#2a3a4b]">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-[#2a3a4b] ml-2">
              Hoy
            </Button>
          </div>
        </div>

        <TabsContent value="mes" className="m-0">
          <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia, i) => (
                  <div key={i} className="text-center text-sm font-medium text-gray-400 py-2">
                    {dia}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Días vacíos antes del inicio del mes */}
                {[...Array(primerDiaSemana)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 md:h-32 p-1 bg-[#0a1525]/50 rounded-md opacity-50"></div>
                ))}

                {/* Días del mes */}
                {dias.map((dia) => (
                  <div
                    key={dia}
                    className={`h-24 md:h-32 p-1 bg-[#0a1525] rounded-md ${dia === currentDay ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex justify-between items-start p-1">
                      <span
                        className={`text-sm font-medium ${dia === currentDay ? "bg-blue-500 text-white h-5 w-5 rounded-full flex items-center justify-center" : ""}`}
                      >
                        {dia}
                      </span>
                      {eventsByDay[dia]?.length > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                          {eventsByDay[dia].length}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {eventsByDay[dia]?.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate
                          ${
                            event.event_type === "meeting"
                              ? "bg-blue-500/20 text-blue-400"
                              : event.event_type === "call"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {new Date(event.start_time).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          - {event.title}
                        </div>
                      ))}
                      {eventsByDay[dia]?.length > 2 && (
                        <div className="text-xs text-gray-400 pl-1">+{eventsByDay[dia].length - 2} más</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Completar la última semana con días vacíos */}
                {[...Array((7 - ((primerDiaSemana + diasEnMes) % 7)) % 7)].map((_, i) => (
                  <div key={`empty-end-${i}`} className="h-24 md:h-32 p-1 bg-[#0a1525]/50 rounded-md opacity-50"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="m-0">
          <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
            <CardHeader>
              <CardTitle className="text-lg">Próximos eventos</CardTitle>
              <CardDescription className="text-gray-400">Eventos programados para los próximos días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Hoy - {now.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                  </h3>
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-3 rounded-lg bg-[#0a1525]">
                        <div className="flex flex-col items-center justify-center w-16 shrink-0">
                          <span className="text-sm text-gray-400">
                            {new Date(event.start_time).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                          <span className="text-xs text-gray-500">-</span>
                          <span className="text-sm text-gray-400">
                            {new Date(event.end_time).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge
                              className={
                                event.event_type === "meeting"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : event.event_type === "call"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-purple-500/20 text-purple-400"
                              }
                            >
                              {event.event_type === "meeting"
                                ? "Reunión"
                                : event.event_type === "call"
                                  ? "Llamada"
                                  : "Tarea"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1e2a3b] border-[#2a3a4b]">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#2a3a4b]" />
                              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Reprogramar</DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#2a3a4b]" />
                              <DropdownMenuItem className="text-red-400">Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    {todayEvents.length === 0 && (
                      <div className="text-center py-4 text-gray-400">No hay eventos programados para hoy</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Mañana -{" "}
                    {new Date(year, month, currentDay + 1).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="space-y-3">
                    {tomorrowEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-3 rounded-lg bg-[#0a1525]">
                        <div className="flex flex-col items-center justify-center w-16 shrink-0">
                          <span className="text-sm text-gray-400">
                            {new Date(event.start_time).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                          <span className="text-xs text-gray-500">-</span>
                          <span className="text-sm text-gray-400">
                            {new Date(event.end_time).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge
                              className={
                                event.event_type === "meeting"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : event.event_type === "call"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-purple-500/20 text-purple-400"
                              }
                            >
                              {event.event_type === "meeting"
                                ? "Reunión"
                                : event.event_type === "call"
                                  ? "Llamada"
                                  : "Tarea"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                        </div>
                        <div>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tomorrowEvents.length === 0 && (
                      <div className="text-center py-4 text-gray-400">No hay eventos programados para mañana</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    {new Date(year, month, currentDay + 2).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="space-y-3">
                    {dayAfterTomorrowEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-3 rounded-lg bg-[#0a1525]">
                        <div className="flex flex-col items-center justify-center w-16 shrink-0">
                          <span className="text-sm text-gray-400">
                            {new Date(event.start_time).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                          <span className="text-xs text-gray-500">-</span>
                          <span className="text-sm text-gray-400">
                            {new Date(event.end_time).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge
                              className={
                                event.event_type === "meeting"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : event.event_type === "call"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-purple-500/20 text-purple-400"
                              }
                            >
                              {event.event_type === "meeting"
                                ? "Reunión"
                                : event.event_type === "call"
                                  ? "Llamada"
                                  : "Tarea"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                        </div>
                        <div>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {dayAfterTomorrowEvents.length === 0 && (
                      <div className="text-center py-4 text-gray-400">No hay eventos programados para este día</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-[#2a3a4b]">
                Ver todos los eventos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

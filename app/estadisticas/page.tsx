import { ArrowUp, ArrowDown, Users, MessageSquare, Clock, Calendar, Download, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatistics, getDailyStatistics } from "@/lib/services/statistics-service"

export default async function EstadisticasPage() {
  // Obtener estadísticas diarias
  const dailyStats = await getDailyStatistics().catch(() => ({}))

  // Obtener estadísticas de los últimos 7 días
  const messagesStats = await getStatistics("messages_responded", 7).catch(() => [])
  const tasksStats = await getStatistics("tasks_automated", 7).catch(() => [])
  const hoursStats = await getStatistics("hours_saved", 7).catch(() => [])

  // Calcular porcentajes de cambio
  const calculateChange = (stats: any[]) => {
    if (stats.length < 2) return { value: 0, isPositive: true }

    const current = stats[stats.length - 1]?.metric_value || 0
    const previous = stats[stats.length - 2]?.metric_value || 0

    if (previous === 0) return { value: 100, isPositive: true }

    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(Math.round(change * 10) / 10),
      isPositive: change >= 0,
    }
  }

  const messagesChange = calculateChange(messagesStats)
  const tasksChange = calculateChange(tasksStats)
  const hoursChange = calculateChange(hoursStats)
  const responseRateChange = { value: 1.2, isPositive: false } // Ejemplo estático

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <p className="text-[#5f756b]">Monitorea el rendimiento de tu asistente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#cfe8d8] gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" className="border-[#cfe8d8] gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Select defaultValue="7d">
            <SelectTrigger className="w-[140px] border-[#cfe8d8] bg-[#ffffff]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent className="bg-[#ffffff] border-[#cfe8d8]">
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="general" className="mb-6">
        <TabsList className="bg-[#ffffff]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-[#ffffff] border-[#cfe8d8]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{dailyStats.messages_responded || 0}</div>
              <Badge
                className={`${messagesChange.isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} hover:bg-green-500/30`}
              >
                {messagesChange.isPositive ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}{" "}
                {messagesChange.value}%
              </Badge>
            </div>
            <p className="text-xs text-[#5f756b] mt-1">vs. periodo anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] border-[#cfe8d8]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{dailyStats.tasks_automated || 0}</div>
              <Badge
                className={`${tasksChange.isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} hover:bg-green-500/30`}
              >
                {tasksChange.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}{" "}
                {tasksChange.value}%
              </Badge>
            </div>
            <p className="text-xs text-[#5f756b] mt-1">vs. periodo anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] border-[#cfe8d8]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Ahorrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{dailyStats.hours_saved || 0}h</div>
              <Badge
                className={`${hoursChange.isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} hover:bg-green-500/30`}
              >
                {hoursChange.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}{" "}
                {hoursChange.value}%
              </Badge>
            </div>
            <p className="text-xs text-[#5f756b] mt-1">vs. periodo anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] border-[#cfe8d8]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{dailyStats.response_rate || 98.2}%</div>
              <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                <ArrowDown className="h-3 w-3 mr-1" /> {responseRateChange.value}%
              </Badge>
            </div>
            <p className="text-xs text-[#5f756b] mt-1">vs. periodo anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#ffffff] border-[#cfe8d8]">
          <CardHeader>
            <CardTitle className="text-lg">Actividad por Día</CardTitle>
            <CardDescription className="text-[#5f756b]">Mensajes y tareas procesadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2">
              {/* Simulación de gráfico de barras con datos reales */}
              {messagesStats.map((stat, i) => {
                const taskStat = tasksStats[i] || { metric_value: 0 }
                const messageHeight = Math.min(stat.metric_value * 5, 200) // Escalar para visualización
                const taskHeight = Math.min(taskStat.metric_value * 5, 100) // Escalar para visualización
                const day = new Date(stat.date_recorded).toLocaleDateString("es-CL", { weekday: "short" }).charAt(0)

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-green-500 rounded-t-sm" style={{ height: `${messageHeight}px` }}></div>
                    <div className="w-full bg-emerald-500 rounded-t-sm" style={{ height: `${taskHeight}px` }}></div>
                    <span className="text-xs text-[#5f756b]">{day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                <span className="text-sm text-[#5f756b]">Mensajes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-emerald-500"></div>
                <span className="text-sm text-[#5f756b]">Tareas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] border-[#cfe8d8]">
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Actividades</CardTitle>
            <CardDescription className="text-[#5f756b]">Por tipo de acción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative flex items-center justify-center">
              {/* Simulación de gráfico circular */}
              <div className="relative h-48 w-48">
                <div className="absolute inset-0 rounded-full border-[16px] border-green-500 rotate-0"></div>
                <div
                  className="absolute inset-0 rounded-full border-[16px] border-emerald-500 rotate-[115deg]"
                  style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)" }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-[16px] border-green-500 rotate-[250deg]"
                  style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 50%, 50% 50%)" }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                <span className="text-sm text-[#5f756b]">WhatsApp (45%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-emerald-500"></div>
                <span className="text-sm text-[#5f756b]">Tareas (40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                <span className="text-sm text-[#5f756b]">Email (15%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#ffffff] border-[#cfe8d8]">
        <CardHeader>
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          <CardDescription className="text-[#5f756b]">Últimas acciones realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: MessageSquare,
                color: "text-green-700",
                bg: "bg-green-500/20",
                title: "Mensaje respondido",
                desc: "Cliente #1 - WhatsApp",
                time: "Hace 5 min",
              },
              {
                icon: Calendar,
                color: "text-emerald-700",
                bg: "bg-emerald-500/20",
                title: "Reunión agendada",
                desc: "Equipo de ventas",
                time: "Hace 25 min",
              },
              {
                icon: Users,
                color: "text-green-400",
                bg: "bg-green-500/20",
                title: "Nuevo cliente registrado",
                desc: "Vía formulario web",
                time: "Hace 1 hora",
              },
              {
                icon: Clock,
                color: "text-orange-400",
                bg: "bg-orange-500/20",
                title: "Recordatorio enviado",
                desc: "Pago pendiente - Cliente #3",
                time: "Hace 2 horas",
              },
              {
                icon: MessageSquare,
                color: "text-green-700",
                bg: "bg-green-500/20",
                title: "Mensaje respondido",
                desc: "Cliente #2 - WhatsApp",
                time: "Hace 3 horas",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg bg-[#f6fbf7]">
                <div className={`h-10 w-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-xs text-[#5f756b]">{item.time}</span>
                  </div>
                  <p className="text-sm text-[#5f756b]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full border-[#cfe8d8]">
            Ver todas las actividades
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

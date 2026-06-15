import Image from "next/image"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Filter,
  Home,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserProfile } from "@/components/user-profile"

const metrics = [
  { label: "Recursos activos", value: "5", detail: "Clientes, chats, calendario, WAHA y planes", icon: Database },
  { label: "Acciones custom", value: "18", detail: "Automatizaciones listas para ejecutar", icon: Workflow },
  { label: "Tareas pendientes", value: "7", detail: "3 requieren revisión humana", icon: Clock3 },
  { label: "Salud operativa", value: "98%", detail: "Servicios conectados y respondiendo", icon: Activity },
]

const resources = [
  {
    name: "Clientes",
    description: "Contactos, oportunidades y estado comercial",
    records: 128,
    status: "Listo",
    href: "/clientes",
    owner: "CRM",
  },
  {
    name: "Conversaciones",
    description: "Bandeja omnicanal conectada con Chatwoot",
    records: 342,
    status: "Sincronizando",
    href: "/chat",
    owner: "Soporte",
  },
  {
    name: "Calendario",
    description: "Reuniones, reservas y próximos seguimientos",
    records: 24,
    status: "Listo",
    href: "/calendario",
    owner: "Agenda",
  },
  {
    name: "WhatsApp WAHA",
    description: "Sesión, QR y estado de conexión",
    records: 1,
    status: "Atención",
    href: "/dashboard/connect-whatsapp",
    owner: "Canales",
  },
]

const automations = [
  { title: "Responder mensajes sin asignar", state: "Recomendado", icon: MessageSquare, href: "/chat" },
  { title: "Crear cliente desde conversación", state: "Acción", icon: Plus, href: "/clientes/nuevo" },
  { title: "Agendar seguimiento comercial", state: "Acción", icon: Calendar, href: "/calendario/nuevo" },
  { title: "Revisar métricas de conversión", state: "Reporte", icon: BarChart3, href: "/estadisticas" },
]

const auditTrail = [
  { event: "WAHA session", description: "Canal validado y listo para enviar mensajes", time: "hace 4 min" },
  { event: "Cliente actualizado", description: "Nueva etiqueta: seguimiento prioritario", time: "hace 18 min" },
  { event: "Regla de agenda", description: "Reuniones bloqueadas fuera del horario comercial", time: "hace 1 h" },
]

function statusClass(status: string) {
  if (status === "Listo") return "bg-green-100 text-green-800 hover:bg-green-100"
  if (status === "Sincronizando") return "bg-amber-100 text-amber-800 hover:bg-amber-100"
  return "bg-red-100 text-red-800 hover:bg-red-100"
}

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f6fbf7] text-[#123326]">
        <Sidebar className="border-r border-[#cfe8d8]">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="SmarterOS Logo" width={44} height={44} className="rounded-lg" priority />
              <div>
                <h1 className="text-base font-bold leading-none">SmarterOS</h1>
                <p className="mt-1 text-xs text-[#5f756b]">Admin Console</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {[
                { href: "/", label: "Dashboard", icon: Home, active: true },
                { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
                { href: "/clientes", label: "Clientes", icon: Users },
                { href: "/calendario", label: "Calendario", icon: Calendar },
                { href: "/configuracion", label: "Configuración", icon: Settings },
              ].map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton tooltip={item.label} asChild isActive={item.active}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="outline" className="w-full justify-start gap-2 border-[#cfe8d8]" asChild>
              <Link href="/chat">
                <MessageSquare className="h-4 w-4" />
                Iniciar chat
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-[#cfe8d8] bg-[#f6fbf7]/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#5f756b]">Operaciones</p>
                <h2 className="text-xl font-bold">Dashboard administrativo</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative hidden lg:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#5f756b]" />
                  <Input
                    type="search"
                    placeholder="Buscar recurso, cliente o acción..."
                    className="w-80 border-[#cfe8d8] bg-white pl-8"
                  />
                </div>
                <Button variant="outline" size="icon" className="relative border-[#cfe8d8] bg-white">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-500" />
                </Button>
                <UserProfile />
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-4 md:p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.label} className="border-[#cfe8d8] bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#41564a]">{metric.label}</CardTitle>
                    <metric.icon className="h-4 w-4 text-green-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="mt-1 text-xs text-[#5f756b]">{metric.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <Card className="border-[#cfe8d8] bg-white">
                <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Recursos administrables</CardTitle>
                    <CardDescription className="text-[#5f756b]">
                      Vista tipo AdminJS para navegar datos, acciones y estado operativo.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-[#cfe8d8]">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </Button>
                    <Button size="sm" className="gap-2 bg-green-700 hover:bg-green-800" asChild>
                      <Link href="/clientes/nuevo">
                        <Plus className="h-4 w-4" />
                        Nuevo
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recurso</TableHead>
                        <TableHead className="hidden md:table-cell">Owner</TableHead>
                        <TableHead>Registros</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map((resource) => (
                        <TableRow key={resource.name}>
                          <TableCell>
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-xs text-[#5f756b]">{resource.description}</div>
                          </TableCell>
                          <TableCell className="hidden text-[#5f756b] md:table-cell">{resource.owner}</TableCell>
                          <TableCell>{resource.records}</TableCell>
                          <TableCell>
                            <Badge className={statusClass(resource.status)}>{resource.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={resource.href} aria-label={`Abrir ${resource.name}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-[#cfe8d8] bg-[#123326] text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Centro de acciones</CardTitle>
                    <SlidersHorizontal className="h-5 w-5 text-green-200" />
                  </div>
                  <CardDescription className="text-green-100">
                    Acciones de negocio listas para ejecutar sobre los recursos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {automations.map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto w-full justify-between border-white/15 bg-white/10 px-3 py-3 text-left text-white hover:bg-white/20 hover:text-white"
                      asChild
                    >
                      <Link href={action.href}>
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-green-400/20">
                            <action.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{action.title}</span>
                            <span className="text-xs text-green-100">{action.state}</span>
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="border-[#cfe8d8] bg-white lg:col-span-2">
                <CardHeader>
                  <CardTitle>Flujo operativo</CardTitle>
                  <CardDescription className="text-[#5f756b]">
                    Señales clave para revisar antes de escalar automatizaciones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Validación de schema", value: "OK", icon: ShieldCheck },
                    { label: "Cola de mensajes", value: "12", icon: MessageSquare },
                    { label: "Jobs automatizados", value: "5 activos", icon: Zap },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-[#cfe8d8] bg-[#f6fbf7] p-4">
                      <item.icon className="mb-3 h-5 w-5 text-green-700" />
                      <div className="text-lg font-semibold">{item.value}</div>
                      <div className="text-sm text-[#5f756b]">{item.label}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-[#cfe8d8] bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Auditoría reciente</CardTitle>
                    <CardDescription className="text-[#5f756b]">Últimos eventos del hub.</CardDescription>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-[#5f756b]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {auditTrail.map((item) => (
                    <div key={`${item.event}-${item.time}`} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{item.event}</div>
                        <p className="text-xs text-[#5f756b]">{item.description}</p>
                        <p className="mt-1 text-xs text-[#7b8d84]">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

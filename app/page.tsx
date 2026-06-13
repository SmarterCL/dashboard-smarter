import Image from "next/image"
import Link from "next/link"
import {
  Bell,
  MessageSquare,
  Plus,
  Search,
  BarChart3,
  Users,
  Calendar,
  Settings,
  Home,
  ArrowRight,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UserProfile } from "@/components/user-profile"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f6fbf7] text-[#123326]">
        <Sidebar className="border-r border-[#cfe8d8]">
          <SidebarHeader className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center">
              <Image src="/images/logo.png" alt="SmarterOS Logo" width={80} height={80} className="mb-2" priority />
              <h1 className="text-xl font-bold">SmarterOS</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" asChild isActive>
                  <Link href="/">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Estadísticas" asChild>
                  <Link href="/estadisticas">
                    <BarChart3 className="h-5 w-5" />
                    <span>Estadísticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Clientes" asChild>
                  <Link href="/clientes">
                    <Users className="h-5 w-5" />
                    <span>Clientes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Calendario" asChild>
                  <Link href="/calendario">
                    <Calendar className="h-5 w-5" />
                    <span>Calendario</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Configuración" asChild>
                  <Link href="/configuracion">
                    <Settings className="h-5 w-5" />
                    <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2" asChild>
              <Link href="/chat">
                <MessageSquare className="h-4 w-4" />
                <span>Iniciar chat</span>
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b border-[#cfe8d8] bg-[#f6fbf7]/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-6 py-4">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#5f756b]" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="w-64 rounded-full bg-[#ffffff] border-[#cfe8d8] pl-8 md:w-80 text-[#123326]"
                  />
                </div>
                <Button variant="outline" size="icon" className="relative border-[#cfe8d8] bg-[#ffffff]">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                    3
                  </span>
                </Button>
                <UserProfile />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarjeta de bienvenida */}
              <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#16a34a] to-[#f2fbf5] border-0 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">¡Bienvenido a SmarterOS Hub!</CardTitle>
                  <CardDescription className="text-green-50">
                    Tu asistente inteligente está listo para ayudarte
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  <Image
                    src="/images/logo.png"
                    alt="SmarterOS Logo"
                    width={120}
                    height={120}
                    className="mx-auto md:mx-0"
                    priority
                  />
                  <div className="space-y-4">
                    <p className="text-green-50">
                      SmarterBOT ya puede ayudarte con tus tareas diarias, responder mensajes y automatizar procesos.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button className="bg-green-600 hover:bg-green-700">Comenzar ahora</Button>
                      <Button variant="outline" className="border-white/70 bg-white/15 text-white hover:bg-white/25">
                        Ver tutorial
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta de WhatsApp */}
              <Card className="bg-[#ffffff] border-[#cfe8d8]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Mensajes de WhatsApp</CardTitle>
                    <Badge className="bg-green-500">Conectado</Badge>
                  </div>
                  <CardDescription className="text-[#5f756b]">Últimos mensajes recibidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-[#f6fbf7] p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cliente #1</span>
                        <span className="text-xs text-[#5f756b]">Hace 5 min</span>
                      </div>
                      <p className="text-sm text-[#41564a] mt-1">"Hola, ¿podemos agendar una reunión para mañana?"</p>
                      <div className="flex justify-end mt-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Responder
                        </Button>
                      </div>
                    </div>

                    <div className="bg-[#f6fbf7] p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cliente #2</span>
                        <span className="text-xs text-[#5f756b]">Hace 30 min</span>
                      </div>
                      <p className="text-sm text-[#41564a] mt-1">
                        "Necesito información sobre los precios del servicio"
                      </p>
                      <div className="flex justify-end mt-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-[#cfe8d8]" asChild>
                    <Link href="/chat">Ver todos los mensajes</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Tarjeta de Estadísticas */}
              <Card className="bg-[#ffffff] border-[#cfe8d8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                  <CardDescription className="text-[#5f756b]">Resumen de actividad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#5f756b]">Mensajes respondidos</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-green-700" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#5f756b]">Tareas automatizadas</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Settings className="h-6 w-6 text-emerald-700" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#5f756b]">Horas ahorradas</p>
                        <p className="text-2xl font-bold">3.5</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-[#cfe8d8]" asChild>
                    <Link href="/estadisticas">Ver reporte completo</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Tarjeta de Acciones Rápidas */}
              <Card className="col-span-1 md:col-span-2 bg-[#ffffff] border-[#cfe8d8]">
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                  <CardDescription className="text-[#5f756b]">Selecciona una acción para comenzar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      className="h-auto py-6 flex flex-col items-center bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      asChild
                    >
                      <Link href="/chat">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <span>Responder mensajes</span>
                      </Link>
                    </Button>

                    <Button className="h-auto py-6 flex flex-col items-center bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                      <Plus className="h-8 w-8 mb-2" />
                      <span>Crear tarea</span>
                    </Button>

                    <Button
                      className="h-auto py-6 flex flex-col items-center bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      asChild
                    >
                      <Link href="/calendario">
                        <Calendar className="h-8 w-8 mb-2" />
                        <span>Agendar reunión</span>
                      </Link>
                    </Button>

                    <Button
                      className="h-auto py-6 flex flex-col items-center bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                      asChild
                    >
                      <Link href="/estadisticas">
                        <BarChart3 className="h-8 w-8 mb-2" />
                        <span>Ver estadísticas</span>
                      </Link>
                    </Button>
                    <Button
                      className="h-auto py-6 flex flex-col items-center bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                      asChild
                    >
                      <Link href="/seed-database">
                        <Database className="h-8 w-8 mb-2" />
                        <span>Poblar Base de Datos</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta de Planes */}
              <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#ffffff] to-[#f6fbf7] border-[#cfe8d8]">
                <CardHeader>
                  <CardTitle className="text-lg">Planes disponibles</CardTitle>
                  <CardDescription className="text-[#5f756b]">Mejora tu experiencia con SmarterOS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#f6fbf7] border-[#cfe8d8]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Plan Básico</CardTitle>
                        <CardDescription className="text-[#5f756b]">Para comenzar</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold mb-4">
                          $19<span className="text-sm font-normal text-[#5f756b]">/mes</span>
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>Respuestas automáticas</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>1 canal de WhatsApp</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>Soporte básico</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Ver detalles</Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-[#f6fbf7] border-green-600 relative">
                      <div className="absolute -top-3 right-4 bg-green-600 px-3 py-1 rounded-full text-xs font-medium">
                        Popular
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Plan Pro</CardTitle>
                        <CardDescription className="text-[#5f756b]">Para negocios</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold mb-4">
                          $49<span className="text-sm font-normal text-[#5f756b]">/mes</span>
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>Todo lo del plan Básico</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>3 canales de WhatsApp</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>Automatizaciones avanzadas</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-green-600 hover:bg-green-700">Ver detalles</Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-[#f6fbf7] border-[#cfe8d8]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Plan Enterprise</CardTitle>
                        <CardDescription className="text-[#5f756b]">Para grandes empresas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold mb-4">
                          $99<span className="text-sm font-normal text-[#5f756b]">/mes</span>
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>Todo lo del plan Pro</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>Canales ilimitados</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-700" />
                            <span>API personalizada</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Ver detalles</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

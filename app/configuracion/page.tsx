import { Save, User, Bell, Lock, MessageSquare, CreditCard, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function ConfiguracionPage() {
  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-gray-400">Personaliza tu experiencia en SmarterOS</p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <div className="flex overflow-auto pb-2">
          <TabsList className="bg-[#1e2a3b] h-auto p-1 flex-wrap">
            <TabsTrigger value="perfil" className="flex gap-2 data-[state=active]:bg-[#0a1525]">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex gap-2 data-[state=active]:bg-[#0a1525]">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex gap-2 data-[state=active]:bg-[#0a1525]">
              <Lock className="h-4 w-4" />
              <span>Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="integraciones" className="flex gap-2 data-[state=active]:bg-[#0a1525]">
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="facturacion" className="flex gap-2 data-[state=active]:bg-[#0a1525]">
              <CreditCard className="h-4 w-4" />
              <span>Facturación</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfil" className="space-y-6">
          <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <CardDescription className="text-gray-400">
                Actualiza tu información personal y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
                    <AvatarFallback className="text-2xl">US</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="border-[#2a3a4b]">
                    Cambiar foto
                  </Button>
                </div>
                <div className="flex-1 grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        placeholder="Tu nombre"
                        defaultValue="Usuario"
                        className="bg-[#0a1525] border-[#2a3a4b]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        placeholder="Tu apellido"
                        defaultValue="Ejemplo"
                        className="bg-[#0a1525] border-[#2a3a4b]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      defaultValue="usuario@ejemplo.com"
                      className="bg-[#0a1525] border-[#2a3a4b]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      placeholder="+56 9 1234 5678"
                      defaultValue="+56 9 1234 5678"
                      className="bg-[#0a1525] border-[#2a3a4b]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" className="border-[#2a3a4b]">
                Cancelar
              </Button>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
            <CardHeader>
              <CardTitle className="text-lg">Preferencias</CardTitle>
              <CardDescription className="text-gray-400">Personaliza tu experiencia en la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma</Label>
                <Select defaultValue="es">
                  <SelectTrigger className="bg-[#0a1525] border-[#2a3a4b]">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2a3b] border-[#2a3a4b]">
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zona-horaria">Zona horaria</Label>
                <Select defaultValue="america-santiago">
                  <SelectTrigger className="bg-[#0a1525] border-[#2a3a4b]">
                    <SelectValue placeholder="Selecciona una zona horaria" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2a3b] border-[#2a3a4b]">
                    <SelectItem value="america-santiago">América/Santiago (GMT-4)</SelectItem>
                    <SelectItem value="america-buenos-aires">América/Buenos Aires (GMT-3)</SelectItem>
                    <SelectItem value="america-bogota">América/Bogotá (GMT-5)</SelectItem>
                    <SelectItem value="europe-madrid">Europa/Madrid (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema oscuro</Label>
                  <p className="text-sm text-gray-400">Activar el tema oscuro en la interfaz</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" className="border-[#2a3a4b]">
                Cancelar
              </Button>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integraciones" className="space-y-6">
          <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
            <CardHeader>
              <CardTitle className="text-lg">Conexión de WhatsApp</CardTitle>
              <CardDescription className="text-gray-400">
                Conecta tu número de WhatsApp para automatizar respuestas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center p-4 bg-[#0a1525] rounded-lg">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">WhatsApp Business API</h3>
                  <p className="text-sm text-gray-400">Conectado - +56 9 1234 5678</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400">Activo</Badge>
                  <Button variant="outline" className="border-[#2a3a4b]">
                    Configurar
                  </Button>
                </div>
              </div>

              <Separator className="bg-[#2a3a4b]" />

              <div className="space-y-4">
                <h3 className="font-medium">Configuración de respuestas</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="respuesta-automatica">Respuestas automáticas</Label>
                    <Switch id="respuesta-automatica" defaultChecked />
                  </div>
                  <p className="text-sm text-gray-400">
                    Permite que SmarterBOT responda automáticamente a mensajes entrantes
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mensaje-ausencia">Mensaje de ausencia</Label>
                    <Switch id="mensaje-ausencia" />
                  </div>
                  <p className="text-sm text-gray-400">Envía un mensaje automático cuando no estés disponible</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje-bienvenida">Mensaje de bienvenida</Label>
                  <Input
                    id="mensaje-bienvenida"
                    placeholder="Escribe tu mensaje de bienvenida"
                    defaultValue="¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?"
                    className="bg-[#0a1525] border-[#2a3a4b]"
                  />
                </div>
              </div>

              <Separator className="bg-[#2a3a4b]" />

              <div className="space-y-4">
                <h3 className="font-medium">Límites y notificaciones</h3>

                <div className="space-y-2">
                  <Label htmlFor="notificaciones-nuevos">Notificar nuevos mensajes</Label>
                  <Select defaultValue="todos">
                    <SelectTrigger className="bg-[#0a1525] border-[#2a3a4b]">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e2a3b] border-[#2a3a4b]">
                      <SelectItem value="todos">Todos los mensajes</SelectItem>
                      <SelectItem value="importantes">Solo mensajes importantes</SelectItem>
                      <SelectItem value="ninguno">No notificar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="limite-mensajes">Limitar mensajes diarios</Label>
                    <Switch id="limite-mensajes" />
                  </div>
                  <p className="text-sm text-gray-400">Establece un límite diario de mensajes enviados</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" className="border-[#2a3a4b]">
                Desconectar
              </Button>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
            <CardHeader>
              <CardTitle className="text-lg">Añadir otro número de WhatsApp</CardTitle>
              <CardDescription className="text-gray-400">
                Conecta números adicionales para gestionar múltiples conversaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nuevo-numero">Número de teléfono</Label>
                <Input id="nuevo-numero" placeholder="+56 9 1234 5678" className="bg-[#0a1525] border-[#2a3a4b]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion-numero">Descripción (opcional)</Label>
                <Input
                  id="descripcion-numero"
                  placeholder="Ej: Ventas, Soporte, etc."
                  className="bg-[#0a1525] border-[#2a3a4b]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Conectar nuevo número
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

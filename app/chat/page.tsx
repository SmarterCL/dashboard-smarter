"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Search,
  Phone,
  Video,
  Smile,
  Check,
  CheckCheck,
  Users,
  Plus,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Datos de ejemplo para chats
const chats = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    ultimoMensaje: "Hola, ¿podemos agendar una reunión para mañana?",
    hora: "10:30",
    noLeidos: 2,
    online: true,
    avatar: null,
  },
  {
    id: 2,
    nombre: "María González",
    ultimoMensaje: "Gracias por la información. Revisaré la propuesta.",
    hora: "09:15",
    noLeidos: 0,
    online: false,
    avatar: null,
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    ultimoMensaje: "Necesito información sobre los precios del servicio",
    hora: "Ayer",
    noLeidos: 0,
    online: true,
    avatar: null,
  },
  {
    id: 4,
    nombre: "Ana Silva",
    ultimoMensaje: "El proyecto está avanzando según lo planeado",
    hora: "Ayer",
    noLeidos: 0,
    online: false,
    avatar: null,
  },
  {
    id: 5,
    nombre: "Roberto Muñoz",
    ultimoMensaje: "¿Podemos coordinar una llamada para discutir los detalles?",
    hora: "Lun",
    noLeidos: 0,
    online: false,
    avatar: null,
  },
]

// Datos de ejemplo para mensajes
const mensajes = [
  {
    id: 1,
    remitente: "cliente",
    texto: "Hola, ¿cómo estás?",
    hora: "10:15",
    leido: true,
  },
  {
    id: 2,
    remitente: "yo",
    texto: "Hola Carlos, todo bien. ¿En qué puedo ayudarte?",
    hora: "10:18",
    leido: true,
  },
  {
    id: 3,
    remitente: "cliente",
    texto: "Quería consultar sobre la disponibilidad para una reunión mañana",
    hora: "10:20",
    leido: true,
  },
  {
    id: 4,
    remitente: "yo",
    texto: "Claro, tengo disponibilidad en la mañana. ¿Te parece bien a las 10:00?",
    hora: "10:22",
    leido: true,
  },
  {
    id: 5,
    remitente: "cliente",
    texto: "Perfecto, a las 10:00 entonces. ¿Podemos hacerla por videollamada?",
    hora: "10:25",
    leido: true,
  },
  {
    id: 6,
    remitente: "yo",
    texto: "Sin problema, te enviaré el enlace de la reunión por este mismo chat unos minutos antes.",
    hora: "10:28",
    leido: true,
  },
  {
    id: 7,
    remitente: "cliente",
    texto: "Hola, ¿podemos agendar una reunión para mañana?",
    hora: "10:30",
    leido: false,
  },
]

export default function ChatPage() {
  const [mensaje, setMensaje] = useState("")
  const [chatActivo, setChatActivo] = useState(1)
  const mensajesFinRef = useRef(null)

  // Scroll al final de los mensajes cuando se carga la página o se envía un mensaje
  useEffect(() => {
    if (mensajesFinRef.current) {
      mensajesFinRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [mensajes])

  const handleEnviarMensaje = () => {
    if (mensaje.trim() === "") return

    // Aquí se enviaría el mensaje a través de una API
    console.log("Mensaje enviado:", mensaje)

    // Limpiar el campo de mensaje
    setMensaje("")
  }

  const chatActual = chats.find((chat) => chat.id === chatActivo)

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)]">
      {/* Panel de chats */}
      <div className="w-80 border-r border-[#1e2a3b] flex flex-col bg-[#0a1525]">
        <div className="p-4 border-b border-[#1e2a3b]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input type="search" placeholder="Buscar chat..." className="pl-8 bg-[#1e2a3b] border-[#2a3a4b]" />
          </div>
        </div>

        <Tabs defaultValue="todos" className="flex-1 flex flex-col">
          <div className="px-2 pt-2">
            <TabsList className="bg-[#1e2a3b] w-full">
              <TabsTrigger value="todos" className="flex-1">
                Todos
              </TabsTrigger>
              <TabsTrigger value="noLeidos" className="flex-1">
                No leídos
              </TabsTrigger>
              <TabsTrigger value="grupos" className="flex-1">
                Grupos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="todos" className="flex-1 overflow-y-auto p-2 space-y-1 m-0">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#1e2a3b] ${chatActivo === chat.id ? "bg-[#1e2a3b]" : ""}`}
                onClick={() => setChatActivo(chat.id)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={chat.avatar || `/placeholder.svg?height=40&width=40&text=${chat.nombre.charAt(0)}`}
                      alt={chat.nombre}
                    />
                    <AvatarFallback>{chat.nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a1525]"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{chat.nombre}</h3>
                    <span className="text-xs text-gray-400">{chat.hora}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{chat.ultimoMensaje}</p>
                </div>
                {chat.noLeidos > 0 && <Badge className="bg-blue-500 text-white">{chat.noLeidos}</Badge>}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="noLeidos" className="flex-1 overflow-y-auto p-2 space-y-1 m-0">
            {chats
              .filter((chat) => chat.noLeidos > 0)
              .map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#1e2a3b] ${chatActivo === chat.id ? "bg-[#1e2a3b]" : ""}`}
                  onClick={() => setChatActivo(chat.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={chat.avatar || `/placeholder.svg?height=40&width=40&text=${chat.nombre.charAt(0)}`}
                      alt={chat.nombre}
                    />
                    <AvatarFallback>{chat.nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{chat.nombre}</h3>
                      <span className="text-xs text-gray-400">{chat.hora}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{chat.ultimoMensaje}</p>
                  </div>
                  <Badge className="bg-blue-500 text-white">{chat.noLeidos}</Badge>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="grupos" className="flex-1 overflow-y-auto p-2 m-0">
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="h-16 w-16 rounded-full bg-[#1e2a3b] flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium">No hay grupos</h3>
              <p className="text-sm text-gray-400 mt-1">Crea un grupo para chatear con varias personas a la vez</p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Crear grupo
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Panel de chat activo */}
      <div className="flex-1 flex flex-col bg-[#0a1525]">
        {chatActual ? (
          <>
            {/* Cabecera del chat */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e2a3b]">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={chatActual.avatar || `/placeholder.svg?height=40&width=40&text=${chatActual.nombre.charAt(0)}`}
                    alt={chatActual.nombre}
                  />
                  <AvatarFallback>{chatActual.nombre.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{chatActual.nombre}</h2>
                  <p className="text-xs text-gray-400">
                    {chatActual.online ? "En línea" : "Último acceso hace 2 horas"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1e2a3b] border-[#2a3a4b]">
                    <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#2a3a4b]" />
                    <DropdownMenuItem>Ver información de contacto</DropdownMenuItem>
                    <DropdownMenuItem>Silenciar notificaciones</DropdownMenuItem>
                    <DropdownMenuItem>Buscar en la conversación</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2a3a4b]" />
                    <DropdownMenuItem className="text-red-400">Eliminar chat</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mensajes */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ backgroundImage: "linear-gradient(to bottom, rgba(10, 21, 37, 0.9), rgba(10, 21, 37, 0.9))" }}
            >
              {mensajes.map((msg) => (
                <div key={msg.id} className={`flex ${msg.remitente === "yo" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.remitente === "yo" ? "bg-blue-600 text-white rounded-br-none" : "bg-[#1e2a3b] rounded-bl-none"
                    }`}
                  >
                    <p>{msg.texto}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        msg.remitente === "yo" ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      <span>{msg.hora}</span>
                      {msg.remitente === "yo" &&
                        (msg.leido ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={mensajesFinRef} />
            </div>

            {/* Entrada de mensaje */}
            <div className="p-4 border-t border-[#1e2a3b]">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEnviarMensaje()}
                  className="flex-1 bg-[#1e2a3b] border-[#2a3a4b]"
                />
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleEnviarMensaje}>
                  <Send className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="h-20 w-20 rounded-full bg-[#1e2a3b] flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium">Selecciona un chat</h2>
            <p className="text-gray-400 mt-2 max-w-md">
              Elige una conversación de la lista o inicia una nueva para comenzar a chatear
            </p>
            <Button className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Nuevo chat
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

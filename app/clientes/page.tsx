import { Search, Plus, Filter, Download, MoreHorizontal, Mail, Phone, MessageSquare, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClients } from "@/lib/services/client-service"

export default async function ClientesPage() {
  // Obtener clientes de la base de datos
  const clients = await getClients()

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-400">Gestiona tus contactos y clientes</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card className="bg-[#1e2a3b] border-[#2a3a4b] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumen de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0a1525] p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
            <div className="bg-[#0a1525] p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Activos</p>
              <p className="text-2xl font-bold">{clients.filter((c) => c.status === "active").length}</p>
            </div>
            <div className="bg-[#0a1525] p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Nuevos (este mes)</p>
              <p className="text-2xl font-bold">
                {
                  clients.filter((c) => {
                    const createdAt = new Date(c.created_at)
                    const now = new Date()
                    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
                  }).length
                }
              </p>
            </div>
            <div className="bg-[#0a1525] p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold">{clients.filter((c) => c.status === "pending").length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e2a3b] border-[#2a3a4b]">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle className="text-lg">Lista de Clientes</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar cliente..."
                  className="w-full md:w-64 pl-8 bg-[#0a1525] border-[#2a3a4b]"
                />
              </div>
              <Button variant="outline" className="border-[#2a3a4b] gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" className="border-[#2a3a4b] gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#0a1525]">
              <TableRow className="hover:bg-[#0a1525]/80 border-[#2a3a4b]">
                <TableHead className="w-[50px]" scope="col">
                  #
                </TableHead>
                <TableHead scope="col">
                  <div className="flex items-center gap-1">
                    Cliente
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </div>
                </TableHead>
                <TableHead scope="col">Contacto</TableHead>
                <TableHead scope="col">Estado</TableHead>
                <TableHead scope="col">Última Interacción</TableHead>
                <TableHead className="text-right" scope="col">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow key={client.id} className="hover:bg-[#0a1525]/50 border-[#2a3a4b]">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=${client.name.charAt(0)}`}
                          alt={client.name}
                        />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        client.status === "active"
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : client.status === "inactive"
                            ? "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                            : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      }
                    >
                      {client.status === "active" ? "Activo" : client.status === "inactive" ? "Inactivo" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.last_interaction
                      ? new Date(client.last_interaction).toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sin interacciones"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1e2a3b] border-[#2a3a4b]">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#2a3a4b]" />
                          <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Historial</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2a3a4b]" />
                          <DropdownMenuItem className="text-red-400">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No hay clientes registrados. ¡Agrega tu primer cliente!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-400">Mostrando {clients.length} clientes</div>
          {clients.length > 10 && (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="border-[#2a3a4b]" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="border-[#2a3a4b] bg-[#0a1525]">
                1
              </Button>
              <Button variant="outline" size="sm" className="border-[#2a3a4b]">
                2
              </Button>
              <Button variant="outline" size="sm" className="border-[#2a3a4b]">
                3
              </Button>
              <Button variant="outline" size="sm" className="border-[#2a3a4b]">
                Siguiente
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createCalendarEvent } from "@/lib/services/calendar-service"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NuevoEventoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    event_type: "meeting",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Combinar fecha y hora
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}:00`)
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}:00`)

      await createCalendarEvent({
        title: formData.title,
        description: formData.description || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        event_type: formData.event_type,
        created_by: "current_user", // En una aplicación real, esto vendría de la sesión
      })

      router.push("/calendario")
      router.refresh()
    } catch (error) {
      console.error("Error al crear evento:", error)
      alert("Ocurrió un error al crear el evento. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Establecer fechas por defecto (hoy)
  const today = new Date().toISOString().split("T")[0]
  if (!formData.start_date) {
    setFormData((prev) => ({
      ...prev,
      start_date: today,
      end_date: today,
      start_time: "09:00",
      end_time: "10:00",
    }))
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/calendario">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Evento</h1>
      </div>

      <Card className="bg-[#1e2a3b] border-[#2a3a4b] max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Información del Evento</CardTitle>
          <CardDescription className="text-gray-400">Ingresa los detalles del nuevo evento</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Título del evento"
                className="bg-[#0a1525] border-[#2a3a4b]"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descripción del evento"
                className="bg-[#0a1525] border-[#2a3a4b] min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de inicio *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  className="bg-[#0a1525] border-[#2a3a4b]"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Hora de inicio *</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  className="bg-[#0a1525] border-[#2a3a4b]"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de fin *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  className="bg-[#0a1525] border-[#2a3a4b]"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">Hora de fin *</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  className="bg-[#0a1525] border-[#2a3a4b]"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de evento</Label>
              <Select defaultValue="meeting" onValueChange={(value) => handleSelectChange("event_type", value)}>
                <SelectTrigger className="bg-[#0a1525] border-[#2a3a4b]">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2a3b] border-[#2a3a4b]">
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="call">Llamada</SelectItem>
                  <SelectItem value="task">Tarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" className="border-[#2a3a4b]" type="button" asChild>
              <Link href="/calendario">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Evento
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

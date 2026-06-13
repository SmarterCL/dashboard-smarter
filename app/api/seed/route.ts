import { type NextRequest, NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-data"

// Añadir verificación de método para evitar llamadas no autorizadas
export async function GET(request: NextRequest) {
  // En producción, deberíamos verificar algún tipo de autenticación
  // const isAuthorized = checkAuthorization(request);
  // if (!isAuthorized) {
  //   return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  // }

  try {
    const result = await seedDatabase()

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 })
    } else {
      return NextResponse.json({ message: result.message, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en la ruta de seed:", error)
    return NextResponse.json(
      { message: "Error interno del servidor", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 })
}

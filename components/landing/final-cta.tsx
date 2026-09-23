import { ArrowRight, LogIn } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LOGIN_URL, SIGNUP_URL } from "@/lib/contact"

export function FinalCta() {
  return (
    <section id="signup" className="bg-primary">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6 md:py-24">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
          Empieza a convertir conversaciones en clientes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/90">
          Crea tu cuenta y activa tu entorno CRM con WhatsApp en menos de 1 minuto.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={SIGNUP_URL}
            className={cn(buttonVariants({ size: "lg" }), "bg-background text-foreground hover:bg-background/90")}
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            PROBAR GRATIS
          </a>
          <a
            href={LOGIN_URL}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10",
            )}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Entrar
          </a>
        </div>
        <p className="mt-4 text-sm font-medium text-primary-foreground/85">
          7 días gratis sin tarjeta de crédito ni compromisos
        </p>
      </div>
    </section>
  )
}

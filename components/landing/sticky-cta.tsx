import { ArrowRight, LogIn } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LOGIN_URL, SIGNUP_URL } from "@/lib/contact"

export function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <a
          href={SIGNUP_URL}
          className={cn(buttonVariants({ size: "lg" }), "flex-1 bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          Probar gratis
        </a>
        <a
          href={LOGIN_URL}
          aria-label="Entrar"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "shrink-0 border-primary/30 text-primary hover:bg-accent")}
        >
          <LogIn className="h-5 w-5" />
        </a>
      </div>
    </div>
  )
}

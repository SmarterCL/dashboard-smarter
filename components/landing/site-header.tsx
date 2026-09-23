import { ArrowRight, LogIn } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { WhatsAppIcon } from "@/components/landing/icons"
import { cn } from "@/lib/utils"
import { LOGIN_URL, SIGNUP_URL } from "@/lib/contact"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">SmarterCRM</span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href={LOGIN_URL}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground hover:bg-accent",
            )}
          >
            <LogIn className="mr-1.5 h-4 w-4" />
            Entrar
          </a>
          <a
            href={SIGNUP_URL}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <ArrowRight className="mr-1.5 h-4 w-4" />
            Probar gratis
          </a>
        </div>
      </div>
    </header>
  )
}

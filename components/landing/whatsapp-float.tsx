/**
 * Botón flotante de WhatsApp — fijo en la esquina inferior derecha.
 * Solo para páginas públicas (landing). No renderizar en el dashboard.
 */
export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/56979540471"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-2 ring-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50"
    >
      <svg
        viewBox="0 0 32 32"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-8 w-8"
      >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.492.648 4.835 1.782 6.87L2 30l7.338-1.75A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Zm0 25.6a11.54 11.54 0 0 1-5.88-1.606l-.422-.25-4.354 1.04 1.072-4.24-.276-.436A11.56 11.56 0 0 1 4.4 16C4.4 9.592 9.592 4.4 16 4.4S27.6 9.592 27.6 16 22.408 27.6 16 27.6Zm6.34-8.658c-.348-.174-2.06-1.016-2.38-1.132-.32-.116-.552-.174-.784.174-.232.348-.9 1.132-1.102 1.364-.202.232-.404.26-.752.086-.348-.174-1.47-.542-2.8-1.726-1.034-.922-1.732-2.06-1.934-2.408-.202-.348-.022-.536.152-.708.156-.156.348-.406.522-.608.174-.202.232-.348.348-.58.116-.232.058-.436-.028-.608-.088-.174-.784-1.89-1.074-2.588-.282-.68-.57-.588-.784-.598l-.668-.012c-.232 0-.608.086-.926.434-.318.348-1.216 1.188-1.216 2.898 0 1.71 1.244 3.362 1.418 3.594.174.232 2.448 3.736 5.932 5.238.83.358 1.476.572 1.982.732.832.264 1.59.226 2.188.138.668-.1 2.06-.842 2.35-1.656.29-.814.29-1.512.202-1.656-.086-.144-.318-.232-.666-.406Z" />
      </svg>
    </a>
  )
}

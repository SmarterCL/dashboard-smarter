"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, Check, CheckCheck, Loader2, MessageSquare, RefreshCw, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatwootConversation = {
  id: number
  status?: string
  unread_count?: number
  meta?: {
    sender?: {
      name?: string | null
      email?: string | null
    }
  }
}

type ChatwootMessage = {
  id: number
  content: string
  conversation_id: number
  message_type: number
  private: boolean
  status: string | null
  created_at: number
  sender_type?: string | null
}

type TrialState = {
  isExpired: boolean
  daysRemaining: number
  trialExpiresAt: string
}

const POLL_INTERVAL_MS = 5_000

function formatMessageTime(timestamp: number) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000))
}

function isOutgoing(message: ChatwootMessage) {
  return message.message_type === 1 || message.sender_type === "User" || message.sender_type === "AgentBot"
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatwootConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatwootMessage[]>([])
  const [trial, setTrial] = useState<TrialState | null>(null)
  const [draft, setDraft] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations],
  )

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/chatwoot/conversations", { cache: "no-store" })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "No se pudo cargar Chatwoot")
    }

    setConversations(payload.conversations || [])
    setTrial(payload.trial || null)
    setActiveConversationId(payload.activeConversation?.id || payload.conversations?.[0]?.id || null)
  }, [])

  const loadMessages = useCallback(async (conversationId: number) => {
    const response = await fetch(`/api/chatwoot/conversations/${conversationId}/messages`, { cache: "no-store" })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || "No se pudieron cargar los mensajes")
    }

    setMessages(payload.messages || [])
  }, [])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      setIsLoading(true)
      setError(null)
      try {
        await fetch("/api/chatwoot/contact", { cache: "no-store" })
        await loadConversations()
      } catch (bootError) {
        if (!cancelled) {
          setError(bootError instanceof Error ? bootError.message : "Error al iniciar el chat")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [loadConversations])

  useEffect(() => {
    if (!activeConversationId) return

    let cancelled = false
    const conversationId = activeConversationId

    async function refreshMessages() {
      try {
        await loadMessages(conversationId)
      } catch (refreshError) {
        if (!cancelled) {
          setError(refreshError instanceof Error ? refreshError.message : "Error al refrescar mensajes")
        }
      }
    }

    refreshMessages()
    const interval = window.setInterval(refreshMessages, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [activeConversationId, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSendMessage() {
    if (!activeConversationId || !draft.trim() || isSending || trial?.isExpired) return

    const content = draft.trim()
    setDraft("")
    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/chatwoot/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo enviar el mensaje")
      }

      await loadMessages(activeConversationId)
    } catch (sendError) {
      setDraft(content)
      setError(sendError instanceof Error ? sendError.message : "Error al enviar el mensaje")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-1 bg-[#f6fbf7] text-[#123326]">
      <aside className="flex w-80 flex-col border-r border-[#cfe8d8] bg-white">
        <div className="border-b border-[#cfe8d8] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">Chat SmarterOS</h1>
              <p className="text-xs text-[#5f756b]">Chatwoot Application API</p>
            </div>
            <Button variant="ghost" size="icon" onClick={loadConversations} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {trial && (
            <Badge className="mt-3 bg-green-600">
              {trial.isExpired ? "Trial expirado" : `${trial.daysRemaining} días de trial`}
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#5f756b]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando conversaciones
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center text-sm text-[#5f756b]">
              <MessageSquare className="mb-3 h-8 w-8" />
              No hay conversaciones activas.
            </div>
          ) : (
            conversations.map((conversation) => {
              const sender = conversation.meta?.sender
              const title = sender?.name || sender?.email || "Workspace SmarterOS"
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[#f6fbf7] ${
                    activeConversationId === conversation.id ? "bg-[#f6fbf7]" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="truncate text-sm font-medium">{title}</h2>
                      <span className="text-xs text-[#5f756b]">#{conversation.id}</span>
                    </div>
                    <p className="truncate text-xs text-[#5f756b]">Estado: {conversation.status || "open"}</p>
                  </div>
                  {!!conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge className="bg-green-600 text-white">{conversation.unread_count}</Badge>
                  )}
                </button>
              )
            })
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#cfe8d8] bg-white px-5">
          <div>
            <h2 className="font-semibold">
              {activeConversation ? `Conversación #${activeConversation.id}` : "Sin conversación activa"}
            </h2>
            <p className="text-xs text-[#5f756b]">Los mensajes se refrescan cada 5 segundos.</p>
          </div>
          {error && (
            <div className="flex max-w-md items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}
        </header>

        {trial?.isExpired ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-red-600" />
            <h2 className="text-xl font-semibold">Trial expirado</h2>
            <p className="mt-2 max-w-md text-[#5f756b]">
              El chat y WAHA quedan bloqueados hasta activar un plan del workspace.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#0a1525] p-4">
              {messages.map((message) => {
                const outgoing = isOutgoing(message)
                return (
                  <div key={message.id} className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        outgoing ? "rounded-br-none bg-green-600 text-white" : "rounded-bl-none bg-white text-[#123326]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                          outgoing ? "text-green-100" : "text-[#5f756b]"
                        }`}
                      >
                        <span>{formatMessageTime(message.created_at)}</span>
                        {outgoing &&
                          (message.status === "read" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[#cfe8d8] bg-white p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={!activeConversationId || isSending}
                  className="flex-1 border-[#cfe8d8] bg-white"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!activeConversationId || !draft.trim() || isSending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

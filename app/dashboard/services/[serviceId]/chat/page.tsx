"use client"

import { useState, useRef, useEffect, use } from "react"
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChunkInfo {
  id: string
  content: string
  similarity: number
  metadata: Record<string, unknown>
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  prompt_used?: string
  context_used?: string
  chunks_used?: ChunkInfo[]
  feedback?: "like" | "dislike"
  error?: boolean
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/services/${serviceId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get response")
      }

      const data = await response.json()

      // Save session ID for conversation continuity
      if (data.session_id) {
        setSessionId(data.session_id)
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        prompt_used: data.prompt_used,
        context_used: data.context_used,
        chunks_used: data.chunks_used,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, something went wrong. Please try again.",
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (messageId: string, type: "like" | "dislike") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: type } : m))
    )
    // TODO: Send feedback to API
  }

  const toggleDebug = (messageId: string) => {
    setExpandedDebug(expandedDebug === messageId ? null : messageId)
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] flex-col px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="text-muted-foreground">
          Test your chatbot and review responses
        </p>
      </div>

      {/* Chat Messages */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">
                  Start a conversation
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Ask questions about your uploaded data. Make sure you have
                  uploaded and processed some sources first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={cn(
                        "flex gap-3",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.error
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted"
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : message.error ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.error
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>

                    {/* Feedback & Debug for assistant messages */}
                    {message.role === "assistant" && !message.error && (
                      <div className="ml-11 mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleFeedback(message.id, "like")}
                            className={cn(
                              message.feedback === "like" && "text-green-500"
                            )}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              handleFeedback(message.id, "dislike")
                            }
                            className={cn(
                              message.feedback === "dislike" && "text-red-500"
                            )}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                          {(message.prompt_used || message.context_used) && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => toggleDebug(message.id)}
                              className="text-xs text-muted-foreground"
                            >
                              {expandedDebug === message.id ? (
                                <>
                                  <ChevronUp className="mr-1 h-3 w-3" />
                                  Hide Debug
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="mr-1 h-3 w-3" />
                                  Show Debug
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Debug Panel */}
                        {expandedDebug === message.id && (
                          <Card className="text-sm">
                            <CardContent className="space-y-4 py-4">
                              {message.chunks_used &&
                                message.chunks_used.length > 0 && (
                                  <div>
                                    <p className="mb-2 font-medium text-muted-foreground">
                                      Retrieved Chunks (
                                      {message.chunks_used.length})
                                    </p>
                                    <div className="space-y-2">
                                      {message.chunks_used.map((chunk, i) => (
                                        <div
                                          key={chunk.id}
                                          className="rounded bg-muted p-2 text-xs"
                                        >
                                          <div className="mb-1 flex justify-between text-muted-foreground">
                                            <span>Chunk {i + 1}</span>
                                            <span>
                                              Similarity:{" "}
                                              {(chunk.similarity * 100).toFixed(
                                                1
                                              )}
                                              %
                                            </span>
                                          </div>
                                          <p className="line-clamp-3">
                                            {chunk.content}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              {message.context_used && (
                                <div>
                                  <p className="mb-1 font-medium text-muted-foreground">
                                    Full Context
                                  </p>
                                  <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                                    {message.context_used}
                                  </pre>
                                </div>
                              )}
                              {message.prompt_used && (
                                <div>
                                  <p className="mb-1 font-medium text-muted-foreground">
                                    Prompt Used
                                  </p>
                                  <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                                    {message.prompt_used}
                                  </pre>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg bg-muted px-4 py-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

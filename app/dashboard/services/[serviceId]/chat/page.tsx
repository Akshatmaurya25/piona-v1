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
  Loader2,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useServices } from "@/lib/contexts/services-context"

interface ChunkInfo {
  id: string
  content: string
  similarity: number
  metadata: Record<string, unknown>
}

interface Message {
  id: string
  dbId?: string // Database ID for feedback API
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
  const { getService } = useServices()
  const service = getService(serviceId)
  const botName = service?.name || "Chat Assistant"
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null)
  const [feedbackIssue, setFeedbackIssue] = useState("")
  const [feedbackExpected, setFeedbackExpected] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

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
        dbId: data.message_id, // Database ID for feedback
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

  const handleFeedback = async (messageId: string, dbId: string | undefined, type: "like" | "dislike") => {
    if (!dbId) {
      // Silently return - button should be disabled anyway
      return
    }

    if (type === "dislike") {
      // Open dialog for dislike feedback
      setFeedbackMessageId(messageId)
      setFeedbackIssue("")
      setFeedbackExpected("")
      setFeedbackDialogOpen(true)
    } else {
      // For likes, submit directly
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback: type } : m))
      )

      try {
        await fetch(`/api/services/${serviceId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatMessageId: dbId,
            feedbackType: "like",
          }),
        })
      } catch (error) {
        console.error("Failed to submit feedback:", error)
      }
    }
  }

  const handleSubmitNegativeFeedback = async () => {
    if (!feedbackMessageId) return

    const message = messages.find((m) => m.id === feedbackMessageId)
    if (!message?.dbId) {
      console.error("No database ID available for feedback")
      setFeedbackDialogOpen(false)
      return
    }

    setIsSubmittingFeedback(true)
    try {
      await fetch(`/api/services/${serviceId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatMessageId: message.dbId,
          feedbackType: "dislike",
          correctionMessage: feedbackIssue || undefined,
          expectedResponse: feedbackExpected || undefined,
        }),
      })

      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === feedbackMessageId ? { ...m, feedback: "dislike" } : m
        )
      )

      setFeedbackDialogOpen(false)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleSkipFeedback = async () => {
    if (!feedbackMessageId) return

    const message = messages.find((m) => m.id === feedbackMessageId)
    if (!message?.dbId) {
      setFeedbackDialogOpen(false)
      return
    }

    // Submit dislike without details
    try {
      await fetch(`/api/services/${serviceId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatMessageId: message.dbId,
          feedbackType: "dislike",
        }),
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === feedbackMessageId ? { ...m, feedback: "dislike" } : m
        )
      )
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }

    setFeedbackDialogOpen(false)
  }

  const toggleDebug = (messageId: string) => {
    setExpandedDebug(expandedDebug === messageId ? null : messageId)
  }

  const handleResetChat = () => {
    setMessages([])
    setSessionId(null)
    setExpandedDebug(null)
  }

  return (
    <div className="flex h-full flex-col">

      {/* Negative Feedback Dialog */}
      <AlertDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>What went wrong?</AlertDialogTitle>
            <AlertDialogDescription>
              Help us improve by telling us what the agent did wrong and what the correct response should be. This is optional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-issue">What did the agent do wrong?</Label>
              <Textarea
                id="feedback-issue"
                placeholder="The response was inaccurate because..."
                value={feedbackIssue}
                onChange={(e) => setFeedbackIssue(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-expected">What should the correct response be?</Label>
              <Textarea
                id="feedback-expected"
                placeholder="The correct response should be..."
                value={feedbackExpected}
                onChange={(e) => setFeedbackExpected(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipFeedback}>
              Skip
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitNegativeFeedback}
              disabled={isSubmittingFeedback}
            >
              {isSubmittingFeedback && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chat Card */}
      <Card className="flex flex-1 flex-col overflow-hidden rounded-none border-x-0 border-b-0">
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
                <Bot className="h-4 w-4 text-brand" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{botName}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Draft Environment</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              className="text-xs"
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Reset Chat
            </Button>
          </div>

          {/* Chat Messages */}
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
                            ? "bg-brand text-white"
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
                            ? "bg-brand text-white"
                            : message.error
                              ? "bg-destructive/10 text-destructive"
                              : "bg-card border border-border"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {/* Source citation badges for assistant messages */}
                        {message.role === "assistant" && !message.error && message.chunks_used && message.chunks_used.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
                            {message.chunks_used.map((chunk, i) => (
                              <span
                                key={chunk.id}
                                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                title={chunk.content.slice(0, 200)}
                              >
                                Source {i + 1} &middot; {(chunk.similarity * 100).toFixed(0)}%
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback & Debug for assistant messages */}
                    {message.role === "assistant" && !message.error && (
                      <div className="ml-11 mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleFeedback(message.id, message.dbId, "like")}
                            disabled={!message.dbId}
                            title={message.dbId ? "Like this response" : "Feedback unavailable for this message"}
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
                              handleFeedback(message.id, message.dbId, "dislike")
                            }
                            disabled={!message.dbId}
                            title={message.dbId ? "Dislike this response" : "Feedback unavailable for this message"}
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
                    <div className="rounded-lg border border-border bg-card px-4 py-2">
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
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-brand text-white hover:bg-brand/80"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {/* Model info footer */}
            <p className="mt-2 text-xs text-muted-foreground">
              Model: GPT-4o &middot; Temperature: 0.7 &middot; Last updated: Just now
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

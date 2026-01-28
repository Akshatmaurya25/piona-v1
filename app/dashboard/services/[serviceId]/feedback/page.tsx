"use client"

import { useState, useEffect, useCallback, use } from "react"
import { ThumbsUp, ThumbsDown, MessageSquare, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FeedbackItem {
  id: string
  feedback_type: "like" | "dislike" | "correction"
  correction_message: string | null
  expected_response: string | null
  user_message: string | null
  bot_response: string | null
  created_at: string
}

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "like" | "dislike" | "correction">("all")

  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}/feedback`)
      if (response.ok) {
        const data = await response.json()
        setFeedback(data)
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const filteredFeedback = feedback.filter(
    (f) => filter === "all" || f.feedback_type === filter
  )

  const stats = {
    total: feedback.length,
    likes: feedback.filter((f) => f.feedback_type === "like").length,
    dislikes: feedback.filter((f) => f.feedback_type === "dislike").length,
    corrections: feedback.filter((f) => f.feedback_type === "correction").length,
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">
          Review user feedback to improve your chatbot
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 pt-6">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.likes}</p>
              <p className="text-sm text-muted-foreground">Positive</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 pt-6">
            <ThumbsDown className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.dislikes}</p>
              <p className="text-sm text-muted-foreground">Negative</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 pt-6">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.corrections}</p>
              <p className="text-sm text-muted-foreground">Corrections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Feedback History</CardTitle>
            <CardDescription>{filteredFeedback.length} items</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={filter}
                onValueChange={(v) => setFilter(v as typeof filter)}
              >
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="like">Likes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dislike">Dislikes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="correction">Corrections</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No feedback yet. Feedback will appear here as users interact with your chatbot.
            </p>
          ) : (
            <div className="divide-y">
              {filteredFeedback.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="mb-2 flex items-center gap-2">
                    {item.feedback_type === "like" && (
                      <Badge variant="default" className="bg-green-500">
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        Positive
                      </Badge>
                    )}
                    {item.feedback_type === "dislike" && (
                      <Badge variant="destructive">
                        <ThumbsDown className="mr-1 h-3 w-3" />
                        Negative
                      </Badge>
                    )}
                    {item.feedback_type === "correction" && (
                      <Badge variant="secondary">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Correction
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    {item.user_message && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          User asked:
                        </p>
                        <p className="text-sm">{item.user_message}</p>
                      </div>
                    )}
                    {item.bot_response && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Bot responded:
                        </p>
                        <p className="text-sm">{item.bot_response}</p>
                      </div>
                    )}
                    {item.correction_message && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Issue:
                        </p>
                        <p className="text-sm text-destructive">
                          {item.correction_message}
                        </p>
                      </div>
                    )}
                    {item.expected_response && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Expected response:
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {item.expected_response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

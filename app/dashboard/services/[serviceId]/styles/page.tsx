"use client"

import { useState, useEffect, useCallback, use } from "react"
import { Plus, Trash2, Star, StarOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { WritingStyle } from "@/lib/types"

export default function StylesPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const [styles, setStyles] = useState<WritingStyle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStyle, setNewStyle] = useState({
    name: "",
    description: "",
    tone: "",
    guidelines: "",
  })

  const fetchStyles = useCallback(async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}/styles`)
      if (response.ok) {
        const data = await response.json()
        setStyles(data)
      }
    } catch (error) {
      console.error("Failed to fetch styles:", error)
    } finally {
      setIsLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    fetchStyles()
  }, [fetchStyles])

  const handleCreate = async () => {
    if (!newStyle.name.trim()) return

    try {
      const response = await fetch(`/api/services/${serviceId}/styles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStyle),
      })

      if (response.ok) {
        const created = await response.json()
        setStyles((prev) => [created, ...prev])
        setNewStyle({ name: "", description: "", tone: "", guidelines: "" })
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to create style:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `/api/services/${serviceId}/styles?styleId=${id}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setStyles((prev) => prev.filter((s) => s.id !== id))
        // Refetch to get updated default
        fetchStyles()
      }
    } catch (error) {
      console.error("Failed to delete style:", error)
    }
  }

  const handleSetDefault = async (id: string) => {
    const style = styles.find((s) => s.id === id)
    if (!style) return

    try {
      const response = await fetch(`/api/services/${serviceId}/styles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...style, is_default: true }),
      })

      if (response.ok) {
        setStyles((prev) =>
          prev.map((s) => ({ ...s, is_default: s.id === id }))
        )
      }
    } catch (error) {
      console.error("Failed to set default:", error)
    }
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Writing Styles</h1>
          <p className="text-muted-foreground">
            Define how your chatbot should respond
          </p>
        </div>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Style
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create Writing Style</AlertDialogTitle>
              <AlertDialogDescription>
                Define a new writing style for your chatbot responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="style-name">Style Name</Label>
                <Input
                  id="style-name"
                  placeholder="e.g., Professional"
                  value={newStyle.name}
                  onChange={(e) =>
                    setNewStyle({ ...newStyle, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="style-description">Description</Label>
                <Input
                  id="style-description"
                  placeholder="Brief description of this style"
                  value={newStyle.description}
                  onChange={(e) =>
                    setNewStyle({ ...newStyle, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="style-tone">Tone</Label>
                <Input
                  id="style-tone"
                  placeholder="e.g., formal, casual, friendly"
                  value={newStyle.tone}
                  onChange={(e) =>
                    setNewStyle({ ...newStyle, tone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="style-guidelines">Guidelines</Label>
                <Textarea
                  id="style-guidelines"
                  placeholder="Specific instructions for this writing style..."
                  value={newStyle.guidelines}
                  onChange={(e) =>
                    setNewStyle({ ...newStyle, guidelines: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCreate}
                disabled={!newStyle.name.trim()}
              >
                Create
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {styles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-muted-foreground">
              No writing styles defined yet
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Style
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((style) => (
            <Card key={style.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {style.name}
                      {style.is_default && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </CardTitle>
                    {style.description && (
                      <CardDescription>{style.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleSetDefault(style.id)}
                      disabled={style.is_default}
                      title={
                        style.is_default
                          ? "Current default"
                          : "Set as default"
                      }
                    >
                      {style.is_default ? (
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(style.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {style.tone && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tone
                    </p>
                    <Badge variant="secondary">{style.tone}</Badge>
                  </div>
                )}
                {style.guidelines && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Guidelines
                    </p>
                    <p className="mt-1 text-sm">{style.guidelines}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

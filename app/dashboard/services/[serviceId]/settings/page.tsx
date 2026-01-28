"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash2, Loader2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useServices } from "@/lib/contexts/services-context"

const embeddingMethods = [
  { value: "openai-text-embedding-3-small", label: "OpenAI text-embedding-3-small", enabled: true },
  { value: "openai-text-embedding-3-large", label: "OpenAI text-embedding-3-large", enabled: false },
  { value: "cohere-embed-v3", label: "Cohere Embed v3", enabled: false },
  { value: "voyage-2", label: "Voyage AI v2", enabled: false },
]

export default function SettingsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const router = useRouter()
  const { getService, updateService, deleteService } = useServices()
  const service = getService(serviceId)

  const [settings, setSettings] = useState({
    name: "",
    description: "",
    embedding_method: "openai-text-embedding-3-small",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (service) {
      setSettings({
        name: service.name,
        description: service.description || "",
        embedding_method: service.embedding_method,
      })
      setIsLoading(false)
    } else {
      // Fetch directly if not in context yet
      fetch(`/api/services/${serviceId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSettings({
              name: data.name,
              description: data.description || "",
              embedding_method: data.embedding_method,
            })
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [service, serviceId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateService(serviceId, settings)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteService(serviceId)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to delete:", error)
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your service settings
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic service information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* RAG Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>RAG Configuration</CardTitle>
            <CardDescription>
              Configure how your data is processed and retrieved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="embedding">Embedding Method</Label>
              <Select
                value={settings.embedding_method}
                onValueChange={(value) =>
                  setSettings({ ...settings, embedding_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {embeddingMethods.map((method) => (
                    <SelectItem
                      key={method.value}
                      value={method.value}
                      disabled={!method.enabled}
                    >
                      <span className="flex items-center gap-2">
                        {method.label}
                        {!method.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The embedding model used to convert your data into vectors
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Service
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your service and all associated data including sources,
                  chat history, and feedback.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSave} disabled={isSaving || !settings.name.trim()}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

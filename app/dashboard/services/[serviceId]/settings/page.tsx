"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash2, Loader2, Key, Eye, EyeOff, Check } from "lucide-react"
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

const llmProviders = [
  { value: "openai", label: "OpenAI", enabled: true, badge: null },
  { value: "anthropic", label: "Anthropic", enabled: false, badge: "Enterprise" },
  { value: "google", label: "Google Vertex", enabled: false, badge: "Soon" },
  { value: "meta", label: "Meta Llama", enabled: false, badge: "Soon" },
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
    llm_provider: "openai",
    llm_api_key: "",
  })
  const [initialSettings, setInitialSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (service) {
      const loaded = {
        name: service.name,
        description: service.description || "",
        embedding_method: service.embedding_method,
        llm_provider: (service as any).llm_provider || "openai",
        llm_api_key: (service as any).llm_api_key || "",
      }
      setSettings(loaded)
      setInitialSettings(loaded)
      setIsLoading(false)
    } else {
      // Fetch directly if not in context yet
      fetch(`/api/services/${serviceId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            const loaded = {
              name: data.name,
              description: data.description || "",
              embedding_method: data.embedding_method,
              llm_provider: data.llm_provider || "openai",
              llm_api_key: data.llm_api_key || "",
            }
            setSettings(loaded)
            setInitialSettings(loaded)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [service, serviceId])

  const handleSaveApiKey = async () => {
    setIsSavingApiKey(true)
    try {
      await updateService(serviceId, {
        llm_provider: settings.llm_provider,
        llm_api_key: settings.llm_api_key,
      })
    } catch (error) {
      console.error("Failed to save API key:", error)
    } finally {
      setIsSavingApiKey(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateService(serviceId, settings)
      setInitialSettings(settings)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    setSettings(initialSettings)
  }

  const handleDelete = async () => {
    try {
      await deleteService(serviceId)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings)

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
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your service settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={!hasChanges}
          >
            Discard
          </Button>
          <Button
            variant="brand"
            onClick={handleSave}
            disabled={isSaving || !settings.name.trim() || !hasChanges}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
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

        {/* LLM Provider */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Provider</CardTitle>
            <CardDescription>
              Choose your language model provider and enter your API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Provider</Label>
              <div className="grid grid-cols-2 gap-3">
                {llmProviders.map((provider) => {
                  const isSelected = settings.llm_provider === provider.value
                  const isDisabled = !provider.enabled
                  return (
                    <button
                      key={provider.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() =>
                        setSettings({ ...settings, llm_provider: provider.value })
                      }
                      className={`relative flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-brand ring-1 ring-brand"
                          : isDisabled
                          ? "cursor-not-allowed border-border opacity-50"
                          : "border-border hover:border-muted-foreground/50 cursor-pointer"
                      }`}
                    >
                      {/* Radio dot */}
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-brand bg-brand"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      {/* Provider name */}
                      <span className="text-sm font-medium">{provider.label}</span>
                      {/* Badge */}
                      {provider.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {provider.badge}
                        </Badge>
                      )}
                      {/* Check icon for selected */}
                      {isSelected && (
                        <Check className="ml-auto h-4 w-4 text-brand" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={settings.llm_api_key}
                    onChange={(e) =>
                      setSettings({ ...settings, llm_api_key: e.target.value })
                    }
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSavingApiKey}
                  size="default"
                >
                  {isSavingApiKey ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSavingApiKey ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and stored securely. It will be used to make requests to the selected LLM provider.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete this service</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this service and all associated data including sources, chat history, and feedback.
                </p>
              </div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

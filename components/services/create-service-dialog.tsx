"use client"

import { useState, useEffect } from "react"
import { Plus, Database, Brain, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

interface CreateServiceDialogProps {
  onCreateService: (name: string, description: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

const serviceTypes = [
  {
    id: "rag",
    label: "RAG Pipeline",
    description: "Upload data and create a chatbot powered by retrieval-augmented generation",
    icon: Database,
    enabled: true,
  },
  {
    id: "fine-tune",
    label: "Fine-tune a Model",
    description: "Fine-tune an existing LLM on your custom dataset",
    icon: Brain,
    enabled: false,
  },
  {
    id: "train",
    label: "Train from Scratch",
    description: "Train a custom model from scratch using your data",
    icon: Cpu,
    enabled: false,
  },
]

export function CreateServiceDialog({
  onCreateService,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: CreateServiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedType, setSelectedType] = useState("rag")

  // Use controlled or internal state
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
      setSelectedType("rag")
    }
  }, [open])

  const handleSubmit = () => {
    if (name.trim()) {
      onCreateService(name.trim(), description.trim())
      setName("")
      setDescription("")
      setSelectedType("rag")
      onOpenChange?.(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <AlertDialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Service</AlertDialogTitle>
          <AlertDialogDescription>
            Choose your approach and create a new AI service.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          {/* Service Type Selection */}
          <div className="grid gap-2">
            <Label>Service Type</Label>
            <div className="grid gap-2">
              {serviceTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  disabled={!type.enabled}
                  onClick={() => type.enabled && setSelectedType(type.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    selectedType === type.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50",
                    !type.enabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <type.icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{type.label}</span>
                      {!type.enabled && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="My Chatbot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your chatbot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={!name.trim()}>
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

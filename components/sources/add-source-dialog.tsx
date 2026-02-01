"use client"

import { useState, useRef } from "react"
import {
  FileUp,
  Database,
  Globe,
  Youtube,
  Link2,
  FileText,
  Table2,
  Lock,
  Upload,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface SourceOption {
  id: string
  label: string
  description: string
  icon: React.ElementType
  available: boolean
}

const sourceOptions: SourceOption[] = [
  {
    id: "file",
    label: "Upload File",
    description: "Upload PDF, CSV, TXT, DOCX, or Excel files",
    icon: FileUp,
    available: true,
  },
  {
    id: "website",
    label: "Website URL",
    description: "Crawl and index content from any website",
    icon: Globe,
    available: false,
  },
  {
    id: "youtube",
    label: "YouTube Video",
    description: "Extract transcripts from YouTube videos",
    icon: Youtube,
    available: false,
  },
  {
    id: "sql",
    label: "SQL Database",
    description: "Connect to PostgreSQL, MySQL, or SQLite",
    icon: Database,
    available: false,
  },
  {
    id: "mongodb",
    label: "MongoDB",
    description: "Connect to your MongoDB collections",
    icon: Database,
    available: false,
  },
  {
    id: "links",
    label: "Links / Sitemap",
    description: "Import from a list of URLs or sitemap.xml",
    icon: Link2,
    available: false,
  },
  {
    id: "notion",
    label: "Notion",
    description: "Import pages from your Notion workspace",
    icon: FileText,
    available: false,
  },
  {
    id: "google-sheets",
    label: "Google Sheets",
    description: "Connect to your Google Sheets documents",
    icon: Table2,
    available: false,
  },
]

interface AddSourceDialogProps {
  serviceId: string
  onSourceAdded: (source: unknown) => void
}

export function AddSourceDialog({ serviceId, onSourceAdded }: AddSourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return
    setIsUploading(true)

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("serviceId", serviceId)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const newSource = await response.json()
          onSourceAdded(newSource)
        } else {
          const error = await response.json()
          console.error("Upload failed:", error)
        }
      } catch (error) {
        console.error("Upload error:", error)
      }
    }

    setIsUploading(false)
    setSelectedOption(null)
    setOpen(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelectedOption(null) }}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {selectedOption === "file" ? "Upload Files" : "Add a New Source"}
          </DialogTitle>
          <DialogDescription>
            {selectedOption === "file"
              ? "Drag and drop files or click to browse. Supported: PDF, CSV, TXT, DOCX, Excel."
              : "Choose how you want to add data to your knowledge base."}
          </DialogDescription>
        </DialogHeader>

        {selectedOption === "file" ? (
          <div className="space-y-4 pt-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
                dragActive
                  ? "border-brand bg-brand/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand" />
                  <p className="text-sm font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drop files here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, CSV, TXT, DOCX, XLS, XLSX
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf,.txt,.docx"
              multiple
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
              disabled={isUploading}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSelectedOption(null)}
              disabled={isUploading}
            >
              Back to options
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {sourceOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (option.available) setSelectedOption(option.id)
                  }}
                  disabled={!option.available}
                  className={`relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors ${
                    option.available
                      ? "border-border hover:border-brand hover:bg-brand/5 cursor-pointer"
                      : "border-border/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className={`rounded-md p-1.5 ${option.available ? "bg-brand/10" : "bg-muted"}`}>
                      <Icon className={`h-4 w-4 ${option.available ? "text-brand" : "text-muted-foreground"}`} />
                    </div>
                    {!option.available && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <Lock className="mr-1 h-2.5 w-2.5" />
                        Soon
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

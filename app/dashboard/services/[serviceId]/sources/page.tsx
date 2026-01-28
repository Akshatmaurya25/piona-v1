"use client"

import { useState, useCallback, useEffect, useRef, use } from "react"
import {
  Upload,
  FileSpreadsheet,
  File,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Source } from "@/lib/types"

const fileTypeConfig = {
  csv: { icon: FileSpreadsheet, label: "CSV", enabled: true },
  excel: { icon: FileSpreadsheet, label: "Excel", enabled: true },
  pdf: { icon: File, label: "PDF", enabled: false },
  docx: { icon: File, label: "Word", enabled: false },
}

const statusConfig: Record<
  string,
  {
    icon: typeof Clock
    label: string
    variant: "secondary" | "default" | "destructive"
    animate?: boolean
  }
> = {
  pending: { icon: Clock, label: "Pending", variant: "secondary" },
  processing: { icon: Loader2, label: "Processing", variant: "secondary", animate: true },
  completed: { icon: CheckCircle, label: "Completed", variant: "default" },
  failed: { icon: AlertCircle, label: "Failed", variant: "destructive" },
}

export default function SourcesPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}/sources`)
      if (response.ok) {
        const data = await response.json()
        setSources(data)
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error)
    } finally {
      setIsLoading(false)
    }
  }, [serviceId])

  // Track if any source is still processing via ref to avoid dependency loop
  const hasProcessing = useRef(false)

  useEffect(() => {
    hasProcessing.current = sources.some(
      (s) => s.status === "processing" || s.status === "pending"
    )
  }, [sources])

  useEffect(() => {
    fetchSources()
    const interval = setInterval(() => {
      if (hasProcessing.current) {
        fetchSources()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchSources])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    },
    [serviceId]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    setIsUploading(true)

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase()
      if (extension === "csv" || extension === "xlsx" || extension === "xls") {
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
            setSources((prev) => [newSource, ...prev])
          } else {
            const error = await response.json()
            console.error("Upload failed:", error)
          }
        } catch (error) {
          console.error("Upload error:", error)
        }
      }
    }

    setIsUploading(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `/api/services/${serviceId}/sources?sourceId=${id}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        setSources(sources.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Delete error:", error)
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
          <h1 className="text-2xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">
            Upload and manage your chatbot&apos;s knowledge base
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSources}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <h3 className="mb-2 text-lg font-medium">Uploading...</h3>
              </>
            ) : (
              <>
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">Upload your data</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
              </>
            )}
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              <Badge variant="default">CSV</Badge>
              <Badge variant="default">Excel</Badge>
              <Badge variant="outline" className="opacity-50">
                PDF (Coming Soon)
              </Badge>
              <Badge variant="outline" className="opacity-50">
                Word (Coming Soon)
              </Badge>
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              multiple
              onChange={handleFileInput}
              disabled={isUploading}
            />
            <Button asChild disabled={isUploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Sources</CardTitle>
            <CardDescription>
              {sources.length} source{sources.length !== 1 && "s"} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {sources.map((source) => {
                const fileType =
                  fileTypeConfig[source.file_type as keyof typeof fileTypeConfig] ||
                  fileTypeConfig.csv
                const status = statusConfig[source.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <div
                    key={source.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <fileType.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{fileType.label}</span>
                          {(source.metadata as { row_count?: number })?.row_count && (
                            <>
                              <span>·</span>
                              <span>
                                {(source.metadata as { row_count?: number }).row_count} rows
                              </span>
                            </>
                          )}
                          {(source.metadata as { chunks_created?: number })?.chunks_created && (
                            <>
                              <span>·</span>
                              <span>
                                {(source.metadata as { chunks_created?: number }).chunks_created} chunks
                              </span>
                            </>
                          )}
                        </div>
                        {source.error_message && (
                          <p className="text-xs text-destructive">
                            {source.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>
                        <StatusIcon
                          className={`mr-1 h-3 w-3 ${
                            status.animate ? "animate-spin" : ""
                          }`}
                        />
                        {status.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

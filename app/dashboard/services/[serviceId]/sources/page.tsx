"use client"

import { useState, useCallback, useEffect, useRef, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  FileSpreadsheet,
  File,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  MoreHorizontal,
  FileText,
  Globe,
  Eye,
} from "lucide-react"
import { AddSourceDialog } from "@/components/sources/add-source-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Source } from "@/lib/types"

// File type icon mapping
const fileTypeIcons: Record<string, typeof File> = {
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  url: Globe,
}

// Badge color mapping for file types
const fileTypeBadgeClasses: Record<string, string> = {
  pdf: "bg-red-500/15 text-red-400 border border-red-500/20",
  url: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  csv: "bg-green-500/15 text-green-400 border border-green-500/20",
  excel: "bg-green-500/15 text-green-400 border border-green-500/20",
  docx: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
  txt: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
}

const fileTypeLabels: Record<string, string> = {
  csv: "CSV",
  excel: "Excel",
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  url: "URL",
}

// Map source status to display status
function getDisplayStatus(status: string): "ready" | "processing" | "error" {
  switch (status) {
    case "completed":
      return "ready"
    case "processing":
    case "pending":
      return "processing"
    case "failed":
      return "error"
    default:
      return "processing"
  }
}

function formatFileSize(metadata: Record<string, unknown>): string {
  const size = metadata?.file_size as number | undefined
  if (!size) return "--"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function SourcesPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const router = useRouter()
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

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

  // Filtered sources
  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      // Search filter
      if (searchQuery && !source.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Type filter
      if (typeFilter !== "all" && source.file_type !== typeFilter) {
        return false
      }
      // Status filter
      if (statusFilter !== "all") {
        const displayStatus = getDisplayStatus(source.status)
        if (displayStatus !== statusFilter) {
          return false
        }
      }
      return true
    })
  }, [sources, searchQuery, typeFilter, statusFilter])

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
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the documents and URLs your AI uses to generate accurate answers.
            Supported formats: PDF, CSV, TXT, DOCX.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSources}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <AddSourceDialog
            serviceId={serviceId}
            onSourceAdded={(source) => {
              setSources((prev) => [source as Source, ...prev])
            }}
          />
        </div>
      </div>

      {/* Drag-and-drop upload zone (shown when dragging or uploading) */}
      {(isDragging || isUploading) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
            isDragging
              ? "border-brand bg-brand/5"
              : "border-muted-foreground/25"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-brand" />
              <h3 className="mb-2 text-lg font-medium">Uploading...</h3>
            </>
          ) : (
            <>
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">Drop files here to upload</h3>
              <p className="text-sm text-muted-foreground">
                Supported: CSV, Excel
              </p>
            </>
          )}
        </div>
      )}

      {/* Invisible drop target when not visibly dragging */}
      {!isDragging && !isUploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ pointerEvents: isDragging ? "auto" : "none" }}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
            <SelectItem value="txt">TXT</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_90px_120px_120px_50px] gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <span>Source Name</span>
          <span>Type</span>
          <span>Size</span>
          <span>Added On</span>
          <span>Status</span>
          <span></span>
        </div>

        {/* Table Body */}
        {filteredSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">
              {sources.length === 0
                ? "No sources added yet. Click \"Add Source\" to get started."
                : "No sources match your filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSources.map((source) => {
              const fileType = source.file_type as string
              const FileIcon = fileTypeIcons[fileType] || File
              const badgeClass = fileTypeBadgeClasses[fileType] || "bg-muted text-muted-foreground"
              const label = fileTypeLabels[fileType] || fileType.toUpperCase()
              const displayStatus = getDisplayStatus(source.status)
              const isClickable = source.status === "completed"

              return (
                <div
                  key={source.id}
                  className={`grid grid-cols-[1fr_100px_90px_120px_120px_50px] gap-4 px-4 py-3 items-center transition-colors ${
                    isClickable
                      ? "cursor-pointer hover:bg-muted/40"
                      : ""
                  }`}
                  onClick={() => {
                    if (isClickable) {
                      router.push(
                        `/dashboard/services/${serviceId}/sources/${source.id}`
                      )
                    }
                  }}
                >
                  {/* Source Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        {source.name}
                      </p>
                      {source.error_message && (
                        <p className="truncate text-xs text-destructive">
                          {source.error_message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Size */}
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(source.metadata)}
                  </span>

                  {/* Added On */}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(source.created_at)}
                  </span>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {displayStatus === "ready" && (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-emerald-500">Ready</span>
                      </>
                    )}
                    {displayStatus === "processing" && (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                        <span className="text-sm text-brand">Processing</span>
                      </>
                    )}
                    {displayStatus === "error" && (
                      <>
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm text-red-500">Error</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isClickable && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(
                                `/dashboard/services/${serviceId}/sources/${source.id}`
                              )
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(source.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer summary */}
      {sources.length > 0 && (
        <div className="mt-3 text-sm text-muted-foreground">
          {filteredSources.length} of {sources.length} source{sources.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}

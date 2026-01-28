"use client"

import { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import {
  ArrowLeft,
  Save,
  Loader2,
  ArrowUpDown,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Chunk {
  id: string
  content: string
  chunk_index: number
  row_reference: string
  metadata: Record<string, unknown>
  created_at: string
}

export default function SourceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string; sourceId: string }>
}) {
  const { serviceId, sourceId } = use(params)
  const router = useRouter()

  const [chunks, setChunks] = useState<Chunk[]>([])
  const [originalChunks, setOriginalChunks] = useState<Chunk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [sourceName, setSourceName] = useState("")

  // Track which chunks have been modified
  const modifiedChunkIds = useMemo(() => {
    const modified = new Set<string>()
    chunks.forEach((chunk) => {
      const original = originalChunks.find((c) => c.id === chunk.id)
      if (original && original.content !== chunk.content) {
        modified.add(chunk.id)
      }
    })
    return modified
  }, [chunks, originalChunks])

  const hasChanges = modifiedChunkIds.size > 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch source info
        const sourceRes = await fetch(`/api/services/${serviceId}/sources`)
        if (sourceRes.ok) {
          const sources = await sourceRes.json()
          const source = sources.find((s: { id: string }) => s.id === sourceId)
          if (source) {
            setSourceName(source.name)
          }
        }

        // Fetch chunks
        const chunksRes = await fetch(
          `/api/services/${serviceId}/sources/${sourceId}/chunks`
        )
        if (chunksRes.ok) {
          const data = await chunksRes.json()
          setChunks(data)
          setOriginalChunks(JSON.parse(JSON.stringify(data)))
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [serviceId, sourceId])

  const handleContentChange = (chunkId: string, newContent: string) => {
    setChunks((prev) =>
      prev.map((chunk) =>
        chunk.id === chunkId ? { ...chunk, content: newContent } : chunk
      )
    )
  }

  const handleSave = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      const updates = chunks
        .filter((chunk) => modifiedChunkIds.has(chunk.id))
        .map((chunk) => ({ id: chunk.id, content: chunk.content }))

      const response = await fetch(
        `/api/services/${serviceId}/sources/${sourceId}/chunks`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        }
      )

      if (response.ok) {
        // Update original chunks to reflect saved state
        setOriginalChunks(JSON.parse(JSON.stringify(chunks)))
      } else {
        const error = await response.json()
        console.error("Save failed:", error)
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const columns: ColumnDef<Chunk>[] = useMemo(
    () => [
      {
        accessorKey: "chunk_index",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            #
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.chunk_index + 1}
          </span>
        ),
        size: 60,
      },
      {
        accessorKey: "row_reference",
        header: "Row Ref",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.row_reference}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ row }) => {
          const isModified = modifiedChunkIds.has(row.original.id)
          return (
            <div className="relative">
              <textarea
                value={row.original.content}
                onChange={(e) =>
                  handleContentChange(row.original.id, e.target.value)
                }
                className={`w-full min-h-[80px] p-2 text-sm rounded-md border resize-y bg-background ${
                  isModified ? "border-orange-400 bg-orange-50/50" : "border-input"
                }`}
                rows={3}
              />
              {isModified && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 text-xs bg-orange-100 text-orange-700 border-orange-300"
                >
                  Modified
                </Badge>
              )}
            </div>
          )
        },
      },
    ],
    [modifiedChunkIds]
  )

  const table = useReactTable({
    data: chunks,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/services/${serviceId}/sources`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{sourceName || "Source"}</h1>
            <p className="text-muted-foreground">
              {chunks.length} chunks · View and edit chunk contents
            </p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes ({modifiedChunkIds.size})
          </Button>
        )}
      </div>

      {/* Search and Stats */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chunks..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Showing{" "}
                <strong>{table.getFilteredRowModel().rows.length}</strong> of{" "}
                <strong>{chunks.length}</strong> chunks
              </span>
              {hasChanges && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  {modifiedChunkIds.size} unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chunks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chunks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/25">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 align-top"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No chunks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

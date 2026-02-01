"use client"

import Link from "next/link"
import { Bot, MoreHorizontal, Trash2, Settings, Database, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Service } from "@/lib/types"

const iconColors = [
  { bg: "bg-teal-500/20", text: "text-teal-400" },
  { bg: "bg-orange-500/20", text: "text-orange-400" },
  { bg: "bg-purple-500/20", text: "text-purple-400" },
  { bg: "bg-pink-500/20", text: "text-pink-400" },
  { bg: "bg-blue-500/20", text: "text-blue-400" },
]

function getColorForId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return iconColors[Math.abs(hash) % iconColors.length]
}

interface ServiceCardProps {
  service: Service
  onDelete?: (id: string) => void
}

export function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const color = getColorForId(service.id)
  const status = (service as any).status || "Active"

  const statusStyles: Record<string, string> = {
    Active: "text-green-400",
    Training: "text-amber-400",
    Paused: "text-gray-400",
  }

  const statusDotStyles: Record<string, string> = {
    Active: "bg-green-400",
    Training: "bg-amber-400",
    Paused: "bg-gray-400",
  }

  return (
    <Link href={`/dashboard/services/${service.id}`} className="block">
      <Card className="group relative transition-all hover:shadow-lg hover:border-brand/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bg}`}>
              <Bot className={`h-5 w-5 ${color.text}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[status]}`} />
                <span className={statusStyles[status]}>{status}</span>
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/services/${service.id}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      onDelete?.(service.id)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardTitle className="mt-3 text-base">{service.name}</CardTitle>
          {service.description && (
            <CardDescription className="line-clamp-2">
              {service.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              {(service as any).source_count ?? 0} Sources
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {(service as any).chat_count ?? 0} Chats
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

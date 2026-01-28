"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Database,
  MessageSquare,
  ThumbsUp,
  Pen,
  Settings,
  LayoutDashboard,
  FileCode,
  BarChart3,
  Plug,
} from "lucide-react"

interface ServiceTabsProps {
  serviceId: string
}

const tabs = [
  {
    label: "Overview",
    href: "",
    icon: LayoutDashboard,
  },
  {
    label: "Sources",
    href: "/sources",
    icon: Database,
  },
  {
    label: "System Files",
    href: "/system-files",
    icon: FileCode,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: ThumbsUp,
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
  {
    label: "Styles",
    href: "/styles",
    icon: Pen,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function ServiceTabs({ serviceId }: ServiceTabsProps) {
  const pathname = usePathname()
  const basePath = `/dashboard/services/${serviceId}`

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="-mb-px flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const href = `${basePath}${tab.href}`
            const isActive =
              tab.href === ""
                ? pathname === basePath
                : pathname.startsWith(href)

            return (
              <Link
                key={tab.href}
                href={href}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

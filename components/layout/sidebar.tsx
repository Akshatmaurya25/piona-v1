"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Database,
  MessageSquare,
  ThumbsUp,
  Pen,
  Settings,
  LayoutDashboard,
  FileCode,
  BarChart3,
  Plug,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

const serviceNavItems = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Sources", href: "/sources", icon: Database },
  { label: "System Files", href: "/system-files", icon: FileCode },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Feedback", href: "/feedback", icon: ThumbsUp },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Styles", href: "/styles", icon: Pen },
]

const bottomNavItems = [
  { label: "Your Plan", href: "/pricing", icon: CreditCard, external: true },
  { label: "Settings", href: "/settings", icon: Settings, external: false },
]

export function Sidebar() {
  const pathname = usePathname()

  // Check if we're on a service page
  const serviceIdMatch = pathname.match(/\/dashboard\/services\/([^/]+)/)
  const currentServiceId = serviceIdMatch ? serviceIdMatch[1] : null
  const basePath = currentServiceId ? `/dashboard/services/${currentServiceId}` : null

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      {/* Header - Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center">
          <Logo variant="full" className="h-6 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Dashboard Home */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "border-l-3 border-brand bg-brand/10 text-brand font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Service Navigation - only show when a service is selected */}
        {currentServiceId && basePath && (
          <>
            <div className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Service
            </div>
            <div className="space-y-1">
              {serviceNavItems.map((item) => {
                const href = `${basePath}${item.href}`
                const isActive =
                  item.href === ""
                    ? pathname === basePath
                    : pathname.startsWith(href)

                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "border-l-3 border-brand bg-brand/10 text-brand font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Bottom Navigation */}
      {currentServiceId && basePath && (
        <div className="border-t p-2 space-y-1">
          {bottomNavItems.map((item) => {
            const href = item.external ? item.href : `${basePath}${item.href}`
            const isActive = !item.external && pathname.startsWith(`${basePath}${item.href}`)

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </aside>
  )
}

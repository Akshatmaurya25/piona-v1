"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { AvatarDropdown } from "./avatar-dropdown"
import { ServiceSelector } from "./service-selector"
import { useServices } from "@/lib/contexts/services-context"
import { CreateServiceDialog } from "@/components/services/create-service-dialog"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const { addService } = useServices()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateService = async (name: string, description: string) => {
    try {
      const newService = await addService(name, description)
      router.push(`/dashboard/services/${newService.id}`)
    } catch (err) {
      console.error("Failed to create service:", err)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
          <ServiceSelector onCreateService={() => setDialogOpen(true)} />
          <AvatarDropdown />
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto [&>div.flex.h-full]:overflow-hidden">{children}</main>
      </div>

      {/* Create Service Dialog (controlled externally) */}
      <CreateServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateService={handleCreateService}
        showTrigger={false}
      />
    </div>
  )
}

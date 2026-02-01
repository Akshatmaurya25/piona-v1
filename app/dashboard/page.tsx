"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/services/service-card"
import { CreateServiceDialog } from "@/components/services/create-service-dialog"
import { useServices } from "@/lib/contexts/services-context"

export default function DashboardPage() {
  const router = useRouter()
  const { services, isLoading, error, addService, deleteService } = useServices()
  const [createOpen, setCreateOpen] = useState(false)

  const handleCreateService = async (name: string, description: string) => {
    try {
      const newService = await addService(name, description)
      router.push(`/dashboard/services/${newService.id}`)
    } catch (err) {
      console.error("Failed to create service:", err)
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id)
    } catch (err) {
      console.error("Failed to delete service:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error: {error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure your Supabase database is set up correctly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Services</h1>
          <p className="text-muted-foreground">
            Manage and monitor your AI chatbots
          </p>
        </div>
        <Button variant="brand" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-medium">No services yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first chatbot service to get started
          </p>
          <Button variant="brand" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onDelete={handleDeleteService}
            />
          ))}
          {/* Create New Service Card */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 py-12 text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Create New Service</span>
          </button>
        </div>
      )}

      <CreateServiceDialog
        onCreateService={handleCreateService}
        open={createOpen}
        onOpenChange={setCreateOpen}
        showTrigger={false}
      />
    </div>
  )
}

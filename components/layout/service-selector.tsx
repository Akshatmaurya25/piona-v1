"use client"

import { usePathname, useRouter } from "next/navigation"
import { Bot, ChevronDown, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useServices } from "@/lib/contexts/services-context"

interface ServiceSelectorProps {
  onCreateService?: () => void
}

export function ServiceSelector({ onCreateService }: ServiceSelectorProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { services, isLoading } = useServices()

  // Extract current service ID from URL
  const serviceIdMatch = pathname.match(/\/dashboard\/services\/([^/]+)/)
  const currentServiceId = serviceIdMatch ? serviceIdMatch[1] : null
  const currentService = currentServiceId
    ? services.find((s) => s.id === currentServiceId)
    : null

  const handleServiceSelect = (serviceId: string) => {
    router.push(`/dashboard/services/${serviceId}`)
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-48">
        <Bot className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          <span className="flex items-center truncate">
            <Bot className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {currentService ? currentService.name : "Select Service"}
            </span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Your Services</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {services.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No services yet
          </div>
        ) : (
          services.map((service) => (
            <DropdownMenuItem
              key={service.id}
              onClick={() => handleServiceSelect(service.id)}
              className="cursor-pointer"
            >
              <Bot className="mr-2 h-4 w-4" />
              <span className="flex-1 truncate">{service.name}</span>
              {service.id === currentServiceId && (
                <Check className="ml-2 h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateService} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Create New Service
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

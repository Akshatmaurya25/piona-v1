"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react"
import type { Service } from "@/lib/types"

interface ServicesContextType {
  services: Service[]
  isLoading: boolean
  error: string | null
  refreshServices: () => Promise<void>
  addService: (name: string, description: string) => Promise<Service>
  deleteService: (id: string) => Promise<void>
  updateService: (id: string, updates: Partial<Service>) => Promise<void>
  getService: (id: string) => Service | undefined
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshServices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/services")
      if (!response.ok) throw new Error("Failed to fetch services")
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshServices()
  }, [refreshServices])

  const addService = useCallback(
    async (name: string, description: string): Promise<Service> => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create service")
      }

      const newService = await response.json()
      setServices((prev) => [newService, ...prev])
      return newService
    },
    []
  )

  const deleteService = useCallback(async (id: string) => {
    const response = await fetch(`/api/services/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete service")
    }

    setServices((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const updateService = useCallback(
    async (id: string, updates: Partial<Service>) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update service")
      }

      const updatedService = await response.json()
      setServices((prev) =>
        prev.map((s) => (s.id === id ? updatedService : s))
      )
    },
    []
  )

  const getService = useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services]
  )

  return (
    <ServicesContext.Provider
      value={{
        services,
        isLoading,
        error,
        refreshServices,
        addService,
        deleteService,
        updateService,
        getService,
      }}
    >
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const context = useContext(ServicesContext)
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider")
  }
  return context
}

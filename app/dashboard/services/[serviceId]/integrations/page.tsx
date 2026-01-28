"use client"

import { use, useState } from "react"
import { Plug, Code } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useServices } from "@/lib/contexts/services-context"
import { WidgetConfig } from "@/lib/types"
import { ApiSection } from "@/components/integrations/api-section"
import { WebhookSection } from "@/components/integrations/webhook-section"
import { FrameworkSnippets } from "@/components/integrations/framework-snippets"
import { WidgetPreview } from "@/components/integrations/widget-preview"
import { ColorCustomizer, defaultConfig } from "@/components/integrations/color-customizer"

export default function IntegrationsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)
  const { getService } = useServices()
  const service = getService(serviceId)

  // Widget customization state
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(defaultConfig)

  // Use a placeholder API key for now (will come from database later)
  const apiKey = service?.api_key || `pk_${serviceId.slice(0, 8)}${serviceId.slice(-8)}`
  const serviceName = service?.name || "Chat Assistant"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your chatbot to external services and embed it on your website
        </p>
      </div>

      {/* API Access Section */}
      <ApiSection apiKey={apiKey} serviceName={serviceName} />

      {/* Embed Widget Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Embed Chat Widget</CardTitle>
              <CardDescription>
                Add a chat widget to your website with just a few lines of code
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-column layout for snippets and preview */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Framework Snippets */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Installation Code
              </h3>
              <FrameworkSnippets apiKey={apiKey} />
            </div>

            {/* Right: Widget Preview */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Live Preview
              </h3>
              <WidgetPreview serviceName={serviceName} config={widgetConfig} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Customizer */}
      <ColorCustomizer config={widgetConfig} onChange={setWidgetConfig} />

      {/* Platform Integrations - at bottom */}
      <WebhookSection />
    </div>
  )
}

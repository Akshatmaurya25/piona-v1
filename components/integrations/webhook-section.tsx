"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

interface PlatformIntegration {
  name: string
  description: string
  icon: string
}

const platforms: PlatformIntegration[] = [
  {
    name: "WordPress",
    description: "Add your chatbot as a WordPress plugin",
    icon: "W",
  },
  {
    name: "Shopify",
    description: "Embed AI chat in your Shopify store",
    icon: "S",
  },
  {
    name: "WhatsApp",
    description: "Deploy your bot on WhatsApp Business",
    icon: "W",
  },
  {
    name: "Slack",
    description: "Connect to your Slack workspace",
    icon: "S",
  },
  {
    name: "Discord",
    description: "Add bot to your Discord server",
    icon: "D",
  },
  {
    name: "Instagram",
    description: "Automate replies on Instagram DMs",
    icon: "I",
  },
  {
    name: "Telegram",
    description: "Deploy your bot on Telegram",
    icon: "T",
  },
  {
    name: "Messenger",
    description: "Connect to Facebook Messenger",
    icon: "M",
  },
  {
    name: "Zapier",
    description: "Automate workflows with Zapier",
    icon: "Z",
  },
  {
    name: "Webhooks",
    description: "Send events to your own server",
    icon: "W",
  },
  {
    name: "Notion",
    description: "Sync knowledge from Notion pages",
    icon: "N",
  },
  {
    name: "HubSpot",
    description: "Integrate with HubSpot CRM",
    icon: "H",
  },
]

export function WebhookSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Platform Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect your chatbot to the platforms your users already use.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {platforms.map((platform) => (
          <Card
            key={platform.name}
            className="relative border-border/40 bg-card/50 opacity-60"
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                {platform.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground/70">
                    {platform.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] px-1.5 py-0"
                  >
                    <Lock className="mr-1 h-2.5 w-2.5" />
                    Coming Soon
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                  {platform.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

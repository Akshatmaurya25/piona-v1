"use client"

import { use } from "react"
import { Plug, Key, Webhook, MessageCircle, Hash, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function IntegrationsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your chatbot to external services and platforms
        </p>
      </div>

      <div className="space-y-6">
        {/* API Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Access
            </CardTitle>
            <CardDescription>
              Use the API to integrate this chatbot into your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Service ID</Label>
              <div className="flex gap-2">
                <Input value={serviceId} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>API Endpoint</Label>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/services/${serviceId}/chat`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Integrations */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <CardDescription>
                Send chat events to your webhook endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Hash className="h-5 w-5" />
                  Slack
                </CardTitle>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <CardDescription>
                Add your chatbot to Slack channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Connect
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5" />
                  Discord
                </CardTitle>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <CardDescription>
                Deploy your chatbot as a Discord bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Connect
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Embed Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              Embed Widget
            </CardTitle>
            <CardDescription>
              Add a chat widget to your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Plug className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-medium">Widget embed coming soon</h3>
              <p className="text-sm text-muted-foreground">
                You&apos;ll be able to embed a chat widget on any website
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

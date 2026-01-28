"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Webhook, MessageCircle, Hash } from "lucide-react"

export function WebhookSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Platform Integrations</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Webhooks Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Coming Soon
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Webhook className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-base">Webhooks</CardTitle>
                <CardDescription className="text-xs">
                  Send events to your server
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Webhook URL
              </label>
              <Input
                placeholder="https://your-server.com/webhook"
                disabled
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Events
              </label>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  message.received
                </Badge>
                <Badge variant="outline" className="text-xs">
                  feedback.received
                </Badge>
              </div>
            </div>
            <Button size="sm" className="w-full" disabled>
              Save Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Slack Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Coming Soon
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base">Slack</CardTitle>
                <CardDescription className="text-xs">
                  Connect to Slack workspace
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">Not connected</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Channel
              </label>
              <Input
                placeholder="#general"
                disabled
                className="text-sm"
              />
            </div>
            <Button size="sm" className="w-full" disabled>
              Connect Slack
            </Button>
          </CardContent>
        </Card>

        {/* Discord Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Coming Soon
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base">Discord</CardTitle>
                <CardDescription className="text-xs">
                  Add bot to your server
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">Not connected</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Server
              </label>
              <Input
                placeholder="Select server..."
                disabled
                className="text-sm"
              />
            </div>
            <Button size="sm" className="w-full" disabled>
              Connect Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

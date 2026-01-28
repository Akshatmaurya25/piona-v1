"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, RotateCcw } from "lucide-react"
import { WidgetConfig } from "@/lib/types"

interface ColorCustomizerProps {
  config: WidgetConfig
  onChange: (config: WidgetConfig) => void
}

const defaultConfig: WidgetConfig = {
  primaryColor: "#3B82F6",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  userBubbleColor: "#3B82F6",
  botBubbleColor: "#F3F4F6",
  accentColor: "#3B82F6",
  fontFamily: "system-ui",
}

interface ColorField {
  key: keyof WidgetConfig
  label: string
  description: string
}

const colorFields: ColorField[] = [
  { key: "primaryColor", label: "Primary Color", description: "Header & buttons" },
  { key: "backgroundColor", label: "Background", description: "Chat window bg" },
  { key: "textColor", label: "Text Color", description: "General text" },
  { key: "userBubbleColor", label: "User Bubble", description: "User messages" },
  { key: "botBubbleColor", label: "Bot Bubble", description: "Bot messages" },
  { key: "accentColor", label: "Accent Color", description: "Links & highlights" },
]

export function ColorCustomizer({ config, onChange }: ColorCustomizerProps) {
  const handleColorChange = (key: keyof WidgetConfig, value: string) => {
    onChange({ ...config, [key]: value })
  }

  const handleReset = () => {
    onChange(defaultConfig)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Customize Widget</CardTitle>
              <CardDescription>
                Personalize your chat widget colors
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colorFields.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium">
                {label}
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    id={key}
                    value={config[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded-lg border cursor-pointer appearance-none bg-transparent"
                    style={{
                      backgroundColor: config[key],
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={config[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="font-mono text-xs h-8"
                    placeholder="#000000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { defaultConfig }

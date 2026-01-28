"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Minus, Send, Bot, User } from "lucide-react"
import { WidgetConfig } from "@/lib/types"

interface WidgetPreviewProps {
  serviceName: string
  config: WidgetConfig
}

type WidgetType = "floating" | "fullpage" | "embed"

interface Message {
  role: "bot" | "user"
  content: string
}

const sampleMessages: Message[] = [
  { role: "bot", content: "Hello! How can I help you today?" },
  { role: "user", content: "What are your opening hours?" },
  { role: "bot", content: "We're open Monday-Friday, 9am-5pm. Is there anything else I can help you with?" },
]

export function WidgetPreview({ serviceName, config }: WidgetPreviewProps) {
  const [widgetType, setWidgetType] = useState<WidgetType>("floating")
  const [isOpen, setIsOpen] = useState(true)

  const widgetTypes: { type: WidgetType; label: string; disabled: boolean }[] = [
    { type: "floating", label: "Floating Chat", disabled: false },
    { type: "fullpage", label: "Full Page", disabled: true },
    { type: "embed", label: "Page Embed", disabled: true },
  ]

  return (
    <div className="space-y-4">
      {/* Widget Type Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Widget Type:</span>
        <div className="flex gap-1">
          {widgetTypes.map(({ type, label, disabled }) => (
            <Button
              key={type}
              variant={widgetType === type ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => setWidgetType(type)}
              className="relative"
            >
              {label}
              {disabled && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 text-[10px] px-1 py-0"
                >
                  Soon
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Preview Frame */}
      <div
        className="relative rounded-lg border-2 border-dashed overflow-hidden"
        style={{ height: "450px" }}
      >
        {/* Simulated Browser Chrome */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-muted flex items-center px-3 gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background rounded px-3 py-1 text-xs text-muted-foreground text-center">
              yourwebsite.com
            </div>
          </div>
        </div>

        {/* Simulated Page Content */}
        <div
          className="absolute top-8 left-0 right-0 bottom-0 p-6"
          style={{ backgroundColor: "#f8fafc" }}
        >
          {/* Fake page content */}
          <div className="space-y-4 opacity-40">
            <div className="h-8 bg-gray-300 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>

          {/* Chat Widget */}
          {widgetType === "floating" && (
            <>
              {/* Expanded Chat Window - positioned above the button */}
              {isOpen && (
                <div
                  className="absolute bottom-20 right-4 rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    width: "320px",
                    backgroundColor: config.backgroundColor,
                  }}
                >
                  {/* Chat Header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-white" />
                      <span className="font-medium text-white text-sm">
                        {serviceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1 hover:bg-white/20 rounded"
                        onClick={() => setIsOpen(false)}
                      >
                        <Minus className="h-4 w-4 text-white" />
                      </button>
                      <button
                        className="p-1 hover:bg-white/20 rounded"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div
                    className="p-4 space-y-3 overflow-y-auto"
                    style={{ height: "220px" }}
                  >
                    {sampleMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor:
                              message.role === "user"
                                ? config.userBubbleColor
                                : config.botBubbleColor,
                          }}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot
                              className="h-4 w-4"
                              style={{ color: config.textColor }}
                            />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className="max-w-[80%] px-3 py-2 rounded-2xl text-sm"
                          style={{
                            backgroundColor:
                              message.role === "user"
                                ? config.userBubbleColor
                                : config.botBubbleColor,
                            color:
                              message.role === "user"
                                ? "#ffffff"
                                : config.textColor,
                          }}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t" style={{ borderColor: config.botBubbleColor }}>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 text-sm rounded-full"
                        style={{
                          backgroundColor: config.botBubbleColor,
                          color: config.textColor,
                        }}
                        disabled
                      />
                      <Button
                        size="icon"
                        className="rounded-full shrink-0"
                        style={{ backgroundColor: config.primaryColor }}
                        disabled
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Bubble Button - always fixed at bottom-right */}
              <button
                className="absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: config.primaryColor }}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <MessageCircle className="h-6 w-6 text-white" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center">
        Click the chat button to toggle the widget open/close
      </p>
    </div>
  )
}

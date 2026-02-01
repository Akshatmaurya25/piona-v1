"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Eye, EyeOff, Key, Terminal } from "lucide-react"

interface ApiSectionProps {
  apiKey: string
  serviceName: string
}

type CodeTab = "curl" | "javascript" | "python"

// Simple syntax highlighting function
function highlightCode(code: string, language: CodeTab): React.ReactElement[] {
  const lines = code.split("\n")

  return lines.map((line, lineIndex) => {
    let highlighted: (string | React.ReactElement)[] = []
    let remaining = line
    let keyIndex = 0

    const addToken = (text: string, className?: string) => {
      if (text) {
        highlighted.push(
          className ? (
            <span key={`${lineIndex}-${keyIndex++}`} className={className}>
              {text}
            </span>
          ) : (
            text
          )
        )
      }
    }

    while (remaining.length > 0) {
      let matched = false

      // Comments
      const commentMatch = remaining.match(/^(#.*)/)
      if (commentMatch) {
        addToken(commentMatch[0], "text-gray-500 italic")
        remaining = remaining.slice(commentMatch[0].length)
        matched = true
        continue
      }

      // Strings (double and single quotes)
      const stringMatch = remaining.match(/^(['"])(?:(?!\1)[^\\]|\\.)*\1/)
      if (stringMatch) {
        addToken(stringMatch[0], "text-emerald-400")
        remaining = remaining.slice(stringMatch[0].length)
        matched = true
        continue
      }

      // cURL flags
      const curlFlagMatch = remaining.match(/^(-[A-Za-z]+|--[a-z-]+)/)
      if (curlFlagMatch && language === "curl") {
        addToken(curlFlagMatch[0], "text-yellow-400")
        remaining = remaining.slice(curlFlagMatch[0].length)
        matched = true
        continue
      }

      // Keywords (JS/Python)
      const keywordMatch = remaining.match(/^(const|let|var|await|async|import|from|def|print|return)\b/)
      if (keywordMatch) {
        addToken(keywordMatch[0], "text-purple-400")
        remaining = remaining.slice(keywordMatch[0].length)
        matched = true
        continue
      }

      // Built-in functions/methods
      const builtinMatch = remaining.match(/^(fetch|JSON|stringify|json|console|log|requests|post|response)\b/)
      if (builtinMatch) {
        addToken(builtinMatch[0], "text-cyan-400")
        remaining = remaining.slice(builtinMatch[0].length)
        matched = true
        continue
      }

      // Object keys (before colon)
      const keyMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/)
      if (keyMatch) {
        addToken(keyMatch[1], "text-sky-300")
        addToken(keyMatch[2], "text-gray-400")
        remaining = remaining.slice(keyMatch[0].length)
        matched = true
        continue
      }

      // Brackets and braces
      const bracketMatch = remaining.match(/^([{}[\]()]+)/)
      if (bracketMatch) {
        addToken(bracketMatch[0], "text-gray-400")
        remaining = remaining.slice(bracketMatch[0].length)
        matched = true
        continue
      }

      // curl command
      const curlMatch = remaining.match(/^(curl)\b/)
      if (curlMatch) {
        addToken(curlMatch[0], "text-cyan-400")
        remaining = remaining.slice(curlMatch[0].length)
        matched = true
        continue
      }

      // Backslash continuation
      const backslashMatch = remaining.match(/^(\\)$/)
      if (backslashMatch) {
        addToken(backslashMatch[0], "text-gray-500")
        remaining = remaining.slice(backslashMatch[0].length)
        matched = true
        continue
      }

      // Default: single character
      if (!matched) {
        addToken(remaining[0])
        remaining = remaining.slice(1)
      }
    }

    return (
      <span key={lineIndex}>
        {highlighted}
        {lineIndex < lines.length - 1 ? "\n" : ""}
      </span>
    )
  })
}

export function ApiSection({ apiKey, serviceName }: ApiSectionProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<CodeTab>("curl")

  const endpoint = `https://piona.fun/api/services/${apiKey}/chat`
  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${"•".repeat(24)}${apiKey.slice(-8)}` : ""

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const codeExamples: Record<CodeTab, { label: string; code: string; file?: string }> = {
    curl: {
      label: "cURL",
      code: `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how can you help me?",
    "session_id": "user-session-123"
  }'`,
    },
    javascript: {
      label: "JavaScript",
      file: "api.js",
      code: `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "Hello, how can you help me?",
    session_id: "user-session-123",
  }),
});

const data = await response.json();
console.log(data.response);`,
    },
    python: {
      label: "Python",
      file: "api.py",
      code: `import requests

response = requests.post(
    "${endpoint}",
    json={
        "message": "Hello, how can you help me?",
        "session_id": "user-session-123",
    }
)

data = response.json()
print(data["response"])`,
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          <CardTitle>API Access</CardTitle>
        </div>
        <CardDescription>
          Use your API key to integrate {serviceName} with your applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                readOnly
                value={showApiKey ? apiKey : maskedKey}
                className="pr-10 font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(apiKey, "apiKey")}
            >
              {copiedField === "apiKey" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Endpoint */}
        <div className="space-y-2">
          <label className="text-sm font-medium">API Endpoint</label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={endpoint}
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(endpoint, "endpoint")}
            >
              {copiedField === "endpoint" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Code Examples</label>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-700">
            {(Object.keys(codeExamples) as CodeTab[]).map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                size="sm"
                className={`rounded-b-none ${
                  activeTab === tab
                    ? "border-b-2 border-primary bg-[#181825] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {codeExamples[tab].label}
              </Button>
            ))}
          </div>

          {/* Code Block */}
          <div className="relative rounded-lg bg-[#1e1e2e] overflow-hidden">
            {codeExamples[activeTab].file && (
              <Badge variant="secondary" className="absolute top-2 left-2 text-xs bg-[#313244] text-gray-300 border-0">
                {codeExamples[activeTab].file}
              </Badge>
            )}
            <pre className="p-4 pt-8 overflow-x-auto text-sm font-mono text-gray-300">
              <code>{highlightCode(codeExamples[activeTab].code, activeTab)}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-[#181825] border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => copyToClipboard(codeExamples[activeTab].code, "code")}
            >
              {copiedField === "code" ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

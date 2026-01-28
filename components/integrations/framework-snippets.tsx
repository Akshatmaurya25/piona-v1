"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, FileCode } from "lucide-react"

interface FrameworkSnippetsProps {
  apiKey: string
}

type Framework = "nextjs" | "react" | "html"

interface SnippetInfo {
  label: string
  icon: string
  file: string
  fileHint: string
  code: string
}

// Simple syntax highlighting function
function highlightCode(code: string, language: "jsx" | "html"): JSX.Element[] {
  const lines = code.split("\n")

  return lines.map((line, lineIndex) => {
    let highlighted: (string | JSX.Element)[] = []
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

    // Process the line character by character with regex patterns
    while (remaining.length > 0) {
      let matched = false

      // Comments (// and <!-- -->)
      const commentMatch = remaining.match(/^(\/\/.*|<!--[\s\S]*?-->|{\/\*[\s\S]*?\*\/})/)
      if (commentMatch) {
        addToken(commentMatch[0], "text-gray-500 italic")
        remaining = remaining.slice(commentMatch[0].length)
        matched = true
        continue
      }

      // Strings (single and double quotes)
      const stringMatch = remaining.match(/^(['"`])(?:(?!\1)[^\\]|\\.)*\1/)
      if (stringMatch) {
        addToken(stringMatch[0], "text-emerald-400")
        remaining = remaining.slice(stringMatch[0].length)
        matched = true
        continue
      }

      // JSX/HTML tags
      const tagMatch = remaining.match(/^(<\/?)([\w-]+)/)
      if (tagMatch) {
        addToken(tagMatch[1], "text-gray-400")
        addToken(tagMatch[2], "text-cyan-400")
        remaining = remaining.slice(tagMatch[0].length)
        matched = true
        continue
      }

      // Closing tag bracket
      const closingMatch = remaining.match(/^(\/>|>)/)
      if (closingMatch) {
        addToken(closingMatch[0], "text-gray-400")
        remaining = remaining.slice(closingMatch[0].length)
        matched = true
        continue
      }

      // Keywords
      const keywordMatch = remaining.match(/^(import|export|default|from|function|const|let|var|return|if|else|async|await|true|false|null|undefined)\b/)
      if (keywordMatch) {
        addToken(keywordMatch[0], "text-purple-400")
        remaining = remaining.slice(keywordMatch[0].length)
        matched = true
        continue
      }

      // React/JSX keywords
      const reactKeywordMatch = remaining.match(/^(useEffect|useState|React|Script)\b/)
      if (reactKeywordMatch) {
        addToken(reactKeywordMatch[0], "text-yellow-400")
        remaining = remaining.slice(reactKeywordMatch[0].length)
        matched = true
        continue
      }

      // HTML attributes and JSX props
      const attrMatch = remaining.match(/^([\w-]+)(=)/)
      if (attrMatch && !remaining.startsWith("//")) {
        addToken(attrMatch[1], "text-sky-300")
        addToken(attrMatch[2], "text-gray-400")
        remaining = remaining.slice(attrMatch[0].length)
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

      // Numbers
      const numMatch = remaining.match(/^\b(\d+)\b/)
      if (numMatch) {
        addToken(numMatch[0], "text-orange-400")
        remaining = remaining.slice(numMatch[0].length)
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

export function FrameworkSnippets({ apiKey }: FrameworkSnippetsProps) {
  const [activeFramework, setActiveFramework] = useState<Framework>("nextjs")
  const [copied, setCopied] = useState(false)

  const snippets: Record<Framework, SnippetInfo> = {
    nextjs: {
      label: "Next.js",
      icon: "N",
      file: "app/layout.tsx",
      fileHint: "Add this to your root layout file",
      code: `import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://piona.fun/widget.js"
          data-api-key="${apiKey}"
          data-position="bottom-right"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}`,
    },
    react: {
      label: "React",
      icon: "R",
      file: "src/App.jsx",
      fileHint: "Add this hook to your main App component",
      code: `import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Load Piona chat widget
    const script = document.createElement('script')
    script.src = 'https://piona.fun/widget.js'
    script.async = true
    script.dataset.apiKey = '${apiKey}'
    script.dataset.position = 'bottom-right'
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  )
}

export default App`,
    },
    html: {
      label: "HTML",
      icon: "</>",
      file: "index.html",
      fileHint: "Add this script before the closing </body> tag",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <!-- Your page content -->

  <!-- Piona Chat Widget -->
  <script
    src="https://piona.fun/widget.js"
    data-api-key="${apiKey}"
    data-position="bottom-right"
    async
  ></script>
</body>
</html>`,
    },
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(snippets[activeFramework].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Framework Tabs */}
      <div className="flex gap-2">
        {(Object.keys(snippets) as Framework[]).map((framework) => (
          <Button
            key={framework}
            variant={activeFramework === framework ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFramework(framework)}
            className="gap-2"
          >
            <span className="font-mono text-xs font-bold">
              {snippets[framework].icon}
            </span>
            {snippets[framework].label}
          </Button>
        ))}
      </div>

      {/* Code Display */}
      <div className="relative rounded-lg border bg-[#1e1e2e] overflow-hidden">
        {/* File Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2 bg-[#181825]">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-gray-400" />
            <code className="text-sm font-medium text-gray-300">
              {snippets[activeFramework].file}
            </code>
          </div>
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
            {snippets[activeFramework].fileHint}
          </Badge>
        </div>

        {/* Code Block */}
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300">
            <code>
              {highlightCode(
                snippets[activeFramework].code,
                activeFramework === "html" ? "html" : "jsx"
              )}
            </code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-[#181825] border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy Code
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

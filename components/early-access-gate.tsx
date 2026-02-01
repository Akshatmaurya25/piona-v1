"use client"

import { useState, useEffect } from "react"
import { Lock, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ACCESS_CODE = "7629"
const STORAGE_KEY = "piona-early-access"

export function EarlyAccessGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true)
    }
  }, [])

  if (!mounted) return null
  if (unlocked) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim() === ACCESS_CODE) {
      localStorage.setItem(STORAGE_KEY, "true")
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-4" style={{ colorScheme: "dark" }}>
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
          <Lock className="h-8 w-8 text-brand" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Early Access
          </h1>
          <p className="text-muted-foreground">
            Piona is currently in early access. Enter your invite code to
            continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Enter access code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(false)
              }}
              maxLength={4}
              className={`h-12 text-center text-lg tracking-[0.5em] ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">
                Invalid code. Please try again.
              </p>
            )}
          </div>

          <Button type="submit" variant="brand" size="lg" className="w-full">
            Unlock Access
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Invite-only preview</span>
        </div>
      </div>
    </div>
  )
}

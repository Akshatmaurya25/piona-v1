"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  variant?: "icon" | "full"
  className?: string
}

export function Logo({ variant = "full", className }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`${variant === "icon" ? "h-8 w-8" : "h-8 w-24"} ${className}`}
      />
    )
  }

  if (variant === "icon") {
    return (
      <Image
        src="/assets/fav_icon.svg"
        alt="Piona"
        width={32}
        height={32}
        className={className}
      />
    )
  }

  return (
    <Image
      src={
        resolvedTheme === "dark"
          ? "/assets/logo_white_long.png"
          : "/assets/logo_black.png"
      }
      alt="Piona"
      width={120}
      height={32}
      className={`h-8 w-auto ${className}`}
    />
  )
}

"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import gsap from "gsap"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
    const els = sectionRef.current.querySelectorAll("[data-animate]")

    tl.fromTo(
      els,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }
    )
  }, [])

  return (
    <section ref={sectionRef} className="container mx-auto px-4 pt-24 pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Text */}
        <div className="space-y-6">
          <div data-animate className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            v2.0 is now live
          </div>

          <h1 data-animate className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Build AI Chatbots{" "}
            <span className="text-brand">From Your Data</span>
          </h1>

          <p data-animate className="max-w-lg text-lg text-muted-foreground">
            The RAG-powered platform for instant, intelligent answers. Connect
            your knowledge base, vectorise in seconds, and deploy to your users.
          </p>

          <div data-animate className="flex flex-wrap gap-3">
            <Button variant="brand" size="lg" asChild>
              <Link href="/dashboard">
                Start Building Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Read Documentation</Link>
            </Button>
          </div>

          <div data-animate className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              14-day free trial
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div data-animate className="relative hidden lg:block">
          <Image
            src="/hero.jpg"
            alt="Piona Dashboard Preview"
            width={720}
            height={480}
            className="rounded-xl border shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  )
}

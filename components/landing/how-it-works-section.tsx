"use client"

import { useEffect, useRef } from "react"
import { FileUp, Cpu, Rocket } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: 1,
    title: "Upload Data",
    description:
      "Connect PDFs, Notion pages, website URLs, or raw text directly. We handle the ingestion pipeline.",
    icon: FileUp,
  },
  {
    num: 2,
    title: "Auto-Process",
    description:
      "We automatically clean, chunk, and vectorize your content into a high-performance database.",
    icon: Cpu,
  },
  {
    num: 3,
    title: "Instant Deploy",
    description:
      "Get a pre-built chat widget to embed on your site or access your agent via our REST API.",
    icon: Rocket,
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const heading = sectionRef.current.querySelector("[data-heading]")
    const cards = sectionRef.current.querySelectorAll("[data-card]")

    if (heading) {
      gsap.fromTo(
        heading,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: heading, start: "top 85%" },
        }
      )
    }

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: cards[0], start: "top 85%" },
      }
    )
  }, [])

  return (
    <section ref={sectionRef} className="py-24">
      <div className="container mx-auto px-4">
        <div data-heading className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            From Raw Data to{" "}
            <span className="text-brand">Intelligent Chat</span>
          </h2>
          <p className="text-muted-foreground">
            Three simple steps to deploy your custom AI assistant. No complex
            pipelines, just connect and chat.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              data-card
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                <step.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mb-2 font-semibold">
                {step.num}. {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

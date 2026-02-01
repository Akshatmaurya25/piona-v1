"use client"

import { useEffect, useRef } from "react"
import {
  RefreshCw,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  Globe,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: "Real-time Sync",
    description:
      "Keep your chatbot updated automatically when your source data changes.",
    icon: RefreshCw,
  },
  {
    title: "Custom Models",
    description:
      "Choose between GPT-4, Claude 3, or open-source models like Llama 3.",
    icon: Sparkles,
  },
  {
    title: "API First",
    description:
      "Build custom interfaces with our lightning-fast, developer-friendly API.",
    icon: Zap,
  },
  {
    title: "Deep Analytics",
    description:
      "Gain insights into what your users are asking and improve your data sources.",
    icon: BarChart3,
  },
  {
    title: "Enterprise Security",
    description:
      "SOC2 Type II compliant infrastructure ensuring your data remains private.",
    icon: Shield,
  },
  {
    title: "Multi-language",
    description:
      "Automatically translate and respond in 95+ languages out of the box.",
    icon: Globe,
  },
]

export function FeaturesSection() {
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
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: cards[0], start: "top 85%" },
      }
    )
  }, [])

  return (
    <section id="features" ref={sectionRef} className="border-t py-24">
      <div className="container mx-auto px-4">
        <div
          data-heading
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to build production-grade AI assistants.
            </p>
          </div>
          <a
            href="#"
            className="hidden text-sm font-medium text-brand hover:underline sm:inline-flex items-center gap-1"
          >
            View all features &rarr;
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              data-card
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const els = sectionRef.current.querySelectorAll("[data-animate]")

    gsap.fromTo(
      els,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      }
    )
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-[#0a0a0a] py-24 text-white"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 data-animate className="text-3xl font-bold sm:text-4xl">
          Ready to chat with your data?
        </h2>
        <p data-animate className="mx-auto mt-4 max-w-xl text-gray-400">
          Join thousands of developers building the next generation of knowledge
          apps with Piona.
        </p>
        <div data-animate className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="brand" size="lg" asChild>
            <Link href="/dashboard">Get Started for Free</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-600 text-white hover:bg-white/10"
            asChild
          >
            <Link href="mailto:sales@piona.fun">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const companies = ["ACME Corp", "Globex", "Soylent", "Initech", "Umbrella"]

export function LogosSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
      }
    )
  }, [])

  return (
    <section ref={sectionRef} className="border-t border-b py-12">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-brand/60">
          Powering next-gen AI startups
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {companies.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold text-muted-foreground/50 sm:text-xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

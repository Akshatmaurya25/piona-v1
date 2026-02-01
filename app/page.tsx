"use client"

import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { LogosSection } from "@/components/landing/logos-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CtaSection } from "@/components/landing/cta-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="landing" />

      <main className="flex-1">
        <HeroSection />
        <LogosSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}

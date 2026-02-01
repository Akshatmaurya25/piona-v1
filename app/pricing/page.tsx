"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"
import { PricingCard, PricingTier } from "@/components/pricing/pricing-card"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for trying out Piona",
    features: [
      "1 Chatbot",
      "50 queries/mo",
      "Community Support",
    ],
    ctaText: "Get Started",
    ctaHref: "/dashboard",
  },
  {
    name: "Basic",
    monthlyPrice: 25,
    yearlyPrice: 240,
    description: "For small projects and startups",
    features: [
      "5 Chatbots",
      "2,000 queries/mo",
      "PDF & Text Support",
      "Basic Analytics",
    ],
    ctaText: "Upgrade to Basic",
    ctaHref: "/dashboard?upgrade=basic",
  },
  {
    name: "Premium",
    monthlyPrice: 100,
    yearlyPrice: 960,
    description: "For growing businesses",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited Chatbots",
      "10,000 queries/mo",
      "Full API Access",
      "Priority Support",
      "Advanced Analytics",
    ],
    ctaText: "Upgrade to Premium",
    ctaHref: "/dashboard?upgrade=premium",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    description: "For large organizations",
    features: [
      "Custom Limits",
      "SSO & Security",
      "Dedicated Manager",
      "SLA & Uptime Guarantee",
    ],
    ctaText: "Contact Sales",
    ctaHref: "mailto:sales@piona.fun",
  },
]

const faqs = [
  {
    question: "What happens if I exceed my query limit?",
    answer:
      "We'll notify you when you reach 80% of your limit. Additional requests will be rate-limited until your next billing cycle. You can always upgrade to a higher plan for more queries.",
  },
  {
    question: "Can I change plans anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption at rest and in transit, and your data is never shared with third parties. Enterprise customers can also opt for dedicated infrastructure.",
  },
  {
    question: "What sources can I use to train my chatbot?",
    answer:
      "You can train your chatbot using PDFs, plain text, web pages, and structured documents. Premium and Enterprise plans unlock additional source types and integrations.",
  },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  )

  return (
    <div className="dark" style={{ colorScheme: "dark" }}>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar variant="landing" />

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free, upgrade as you grow. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={
                billingPeriod === "monthly"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={billingPeriod === "yearly"}
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "yearly" : "monthly"
                )
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                billingPeriod === "yearly" ? "bg-brand" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  billingPeriod === "yearly"
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={
                billingPeriod === "yearly"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              Yearly
            </span>
            <Badge variant="secondary" className="ml-1 text-brand">
              Save 20%
            </Badge>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                billingPeriod={billingPeriod}
              />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-brand"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Piona
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Piona. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

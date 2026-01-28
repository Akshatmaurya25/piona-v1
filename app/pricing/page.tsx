"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PricingCard, PricingTier } from "@/components/pricing/pricing-card"
import { Check, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for trying out Piona",
    features: [
      "50 API requests/month",
      "1 chatbot service",
      "500MB storage",
      "Shared vector database",
      "Community support",
      "Basic analytics",
    ],
    ctaText: "Get Started",
    ctaHref: "/dashboard",
  },
  {
    name: "Basic",
    price: 25,
    period: "month",
    description: "For small projects and startups",
    features: [
      "200 API requests/month",
      "3 chatbot services",
      "2GB storage",
      "Dedicated vector database",
      "Email support",
      "Full analytics",
      "Custom writing styles",
    ],
    ctaText: "Upgrade to Basic",
    ctaHref: "/dashboard?upgrade=basic",
  },
  {
    name: "Premium",
    price: 100,
    period: "month",
    description: "For growing businesses",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "2,000 API requests/month",
      "10 chatbot services",
      "10GB storage",
      "Dedicated vector database",
      "Priority support",
      "Advanced analytics",
      "Custom writing styles",
      "Webhook integrations",
      "Remove Piona branding",
    ],
    ctaText: "Upgrade to Premium",
    ctaHref: "/dashboard?upgrade=premium",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited API requests",
      "Unlimited chatbot services",
      "Custom storage",
      "Dedicated infrastructure",
      "24/7 dedicated support",
      "SLA guarantee (99.9%)",
      "Custom integrations",
      "SSO/SAML authentication",
      "On-premise option",
    ],
    ctaText: "Contact Sales",
    ctaHref: "mailto:sales@piona.fun",
  },
]

const comparisonFeatures = [
  { name: "API Requests/month", free: "50", basic: "200", premium: "2,000", enterprise: "Unlimited" },
  { name: "Chatbot Services", free: "1", basic: "3", premium: "10", enterprise: "Unlimited" },
  { name: "Storage", free: "500MB", basic: "2GB", premium: "10GB", enterprise: "Custom" },
  { name: "Vector Database", free: "Shared", basic: "Dedicated", premium: "Dedicated", enterprise: "Dedicated" },
  { name: "Support", free: "Community", basic: "Email", premium: "Priority", enterprise: "24/7 Dedicated" },
  { name: "Analytics", free: true, basic: true, premium: true, enterprise: true },
  { name: "Custom Writing Styles", free: false, basic: true, premium: true, enterprise: true },
  { name: "Webhook Integrations", free: false, basic: false, premium: true, enterprise: true },
  { name: "Remove Branding", free: false, basic: false, premium: true, enterprise: true },
  { name: "SSO/SAML", free: false, basic: false, premium: false, enterprise: true },
  { name: "SLA Guarantee", free: false, basic: false, premium: false, enterprise: true },
  { name: "On-premise Deployment", free: false, basic: false, premium: false, enterprise: true },
]

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits.",
  },
  {
    question: "What happens if I exceed my API limits?",
    answer: "We'll notify you when you reach 80% of your limit. Additional requests will be rate-limited until your next billing cycle. You can always upgrade to a higher plan for more requests.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact us within 14 days of purchase for a full refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay via invoice.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes! Save 20% when you pay annually instead of monthly. Annual plans are billed upfront for the entire year.",
  },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          Simple Pricing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free, upgrade as you grow. No hidden fees, no surprises.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Compare Features
        </h2>
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium">Feature</th>
                <th className="text-center py-4 px-4 font-medium">Free</th>
                <th className="text-center py-4 px-4 font-medium">Basic</th>
                <th className="text-center py-4 px-4 font-medium bg-primary/5 rounded-t-lg">
                  Premium
                </th>
                <th className="text-center py-4 px-4 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={cn(
                    "border-b",
                    index % 2 === 0 && "bg-muted/30"
                  )}
                >
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="py-3 px-4 text-center">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <FeatureValue value={feature.basic} />
                  </td>
                  <td className="py-3 px-4 text-center bg-primary/5">
                    <FeatureValue value={feature.premium} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <FeatureValue value={feature.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto bg-muted/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Start free today, no credit card required.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Piona. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
    )
  }
  return <span className="text-sm">{value}</span>
}

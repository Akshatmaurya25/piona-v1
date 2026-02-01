"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PricingTier {
  name: string
  monthlyPrice: number | string
  yearlyPrice: number | string
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
  ctaText: string
  ctaHref: string
}

interface PricingCardProps {
  tier: PricingTier
  billingPeriod: "monthly" | "yearly"
}

export function PricingCard({ tier, billingPeriod }: PricingCardProps) {
  const {
    name,
    monthlyPrice,
    yearlyPrice,
    description,
    features,
    highlighted = false,
    badge,
    ctaText,
    ctaHref,
  } = tier

  const price = billingPeriod === "monthly" ? monthlyPrice : yearlyPrice
  const isContactUs = typeof price === "string"

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-visible",
        highlighted && "ring-2 ring-brand shadow-lg scale-105"
      )}
    >
      {badge && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-brand-foreground px-3 py-1"
        >
          {badge}
        </Badge>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price Display */}
        <div className="mb-6">
          {isContactUs ? (
            <div className="text-4xl font-bold">{price}</div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">
                ${price}
              </span>
              <span className="text-muted-foreground">
                /{billingPeriod === "monthly" ? "mo" : "yr"}
              </span>
            </div>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          asChild
          className="w-full"
          variant={highlighted ? "brand" : "outline"}
          size="lg"
        >
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

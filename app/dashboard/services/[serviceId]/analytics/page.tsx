"use client"

import { use } from "react"
import {
  BarChart3,
  MessageSquare,
  Clock,
  TrendingUp,
  Database,
  ThumbsUp,
  Download,
  CalendarDays,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stats = [
  {
    label: "Total Sources",
    value: "12",
    trend: "+2%",
    trendPositive: true,
    icon: Database,
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    label: "Total Chats",
    value: "1,248",
    trend: "+12%",
    trendPositive: true,
    icon: MessageSquare,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    label: "Avg. Response",
    value: "1.4s",
    trend: "-0.2s",
    trendPositive: false,
    icon: Clock,
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    label: "Feedback Score",
    value: "94%",
    trend: "+5%",
    trendPositive: true,
    icon: ThumbsUp,
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
]

const topQuestions = [
  { rank: 1, question: "How do I reset my password?", count: 142 },
  { rank: 2, question: "What are your pricing plans?", count: 118 },
  { rank: 3, question: "How to integrate the API?", count: 95 },
  { rank: 4, question: "Where can I find documentation?", count: 87 },
  { rank: 5, question: "How do I contact support?", count: 64 },
]

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your chatbot performance and usage trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Oct 1 - Oct 31, 2023</span>
          </div>
          <Button variant="brand">
            <Download className="h-4 w-4" data-icon="inline-start" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span
                      className={`text-xs font-medium ${
                        stat.trendPositive
                          ? "text-green-400"
                          : "text-orange-400"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Conversations Over Time Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Conversations Over Time</CardTitle>
            <CardDescription>
              Engagement metrics for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border/50 bg-muted/20">
              {/* Stylized chart placeholder */}
              <svg
                className="h-full w-full"
                viewBox="0 0 800 250"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#AA00FF"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="#AA00FF"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[50, 100, 150, 200].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="800"
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.07"
                    strokeDasharray="4 4"
                  />
                ))}
                {/* Area fill */}
                <path
                  d="M0,200 C50,190 100,180 150,160 C200,140 250,150 300,120 C350,90 400,100 450,80 C500,60 550,70 600,50 C650,40 700,55 750,30 L800,25 L800,250 L0,250 Z"
                  fill="url(#chartGradient)"
                />
                {/* Line */}
                <path
                  d="M0,200 C50,190 100,180 150,160 C200,140 250,150 300,120 C350,90 400,100 450,80 C500,60 550,70 600,50 C650,40 700,55 750,30 L800,25"
                  fill="none"
                  stroke="#AA00FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Data points */}
                {[
                  [0, 200],
                  [150, 160],
                  [300, 120],
                  [450, 80],
                  [600, 50],
                  [750, 30],
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#AA00FF"
                    stroke="var(--background, #0a0a0a)"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              {/* Y-axis labels */}
              <div className="absolute left-3 top-0 flex h-full flex-col justify-between py-4 text-[10px] text-muted-foreground">
                <span>250</span>
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
            <CardDescription>Most frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topQuestions.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {item.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {item.question}
                  </span>
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {item.count} queries
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Messages Volume</CardTitle>
            <CardDescription>
              Inbound and outbound message distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex h-64 items-end justify-around overflow-hidden rounded-lg border border-border/50 bg-muted/20 px-4 pb-6 pt-4">
              {/* Bar chart placeholder */}
              {[65, 45, 80, 55, 90, 70, 50, 85, 60, 75, 95, 40].map(
                (height, i) => (
                  <div
                    key={i}
                    className="flex w-full max-w-[28px] flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        background:
                          i % 2 === 0
                            ? "linear-gradient(to top, rgba(170,0,255,0.4), rgba(170,0,255,0.8))"
                            : "linear-gradient(to top, rgba(170,0,255,0.15), rgba(170,0,255,0.35))",
                      }}
                    />
                  </div>
                )
              )}
              {/* X-axis line */}
              <div className="absolute bottom-5 left-4 right-4 border-t border-border/40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Database, MessageSquare, Upload, Sparkles, Zap, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Build AI Chatbots{" "}
              <span className="text-primary">Trained on Your Data</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Upload your documents, create intelligent chatbots, and embed them
              anywhere. RAG-as-a-Service made simple.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/40 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold">
                Everything You Need to Build Smart Assistants
              </h2>
              <p className="text-muted-foreground">
                From data upload to deployment, we handle the complexity so you
                can focus on your business.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Upload className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Easy Data Upload</CardTitle>
                  <CardDescription>
                    Upload CSV, Excel files and more. We handle chunking,
                    embedding, and indexing automatically.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Database className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Vector Storage</CardTitle>
                  <CardDescription>
                    Your data is securely stored and indexed for lightning-fast
                    semantic search and retrieval.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Smart Chatbots</CardTitle>
                  <CardDescription>
                    AI-powered chatbots that understand context and provide
                    accurate answers from your data.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Sparkles className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Custom Writing Styles</CardTitle>
                  <CardDescription>
                    Define how your chatbot should respond. Set tone, style, and
                    provide examples for consistent messaging.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>
                    Integrate with your existing tools via our simple REST API.
                    Or embed our chat widget directly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Feedback & Training</CardTitle>
                  <CardDescription>
                    Improve accuracy over time. Review responses, provide
                    corrections, and train your bot to be better.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-muted-foreground">
                Create your first AI-powered chatbot in minutes. No credit card
                required.
              </p>
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Piona. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

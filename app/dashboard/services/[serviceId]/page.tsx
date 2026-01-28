import Link from "next/link"
import { ArrowRight, Database, MessageSquare, ThumbsUp, Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function ServiceOverviewPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Service Overview</h1>
        <p className="text-muted-foreground">
          Manage your chatbot service and its data
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <Database className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Sources</CardTitle>
            <CardDescription>
              Upload and manage data sources for your chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/services/${serviceId}/sources`}>
                Manage Sources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageSquare className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Test your chatbot and see how it responds to queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/services/${serviceId}/chat`}>
                Open Chat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ThumbsUp className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Feedback</CardTitle>
            <CardDescription>
              Review user feedback and improve your chatbot responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/services/${serviceId}/feedback`}>
                View Feedback
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Pen className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Writing Styles</CardTitle>
            <CardDescription>
              Configure how your chatbot writes its responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/services/${serviceId}/styles`}>
                Configure Styles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

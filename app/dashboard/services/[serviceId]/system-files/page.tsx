"use client"

import { use } from "react"
import { FileCode, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function SystemFilesPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = use(params)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">System Files</h1>
        <p className="text-muted-foreground">
          Configure system prompts and context for your chatbot
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              System Prompt
            </CardTitle>
            <CardDescription>
              The base instructions that define how your chatbot behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                placeholder="You are a helpful assistant that..."
                rows={8}
                defaultValue="You are a helpful AI assistant that answers questions based on the provided context. Be concise and direct in your responses."
              />
            </div>
            <Button disabled>
              <Save className="mr-2 h-4 w-4" />
              Save Changes (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Context Files</CardTitle>
            <CardDescription>
              Additional context files that are always included in conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileCode className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-medium">No context files yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload files that should always be available to your chatbot
              </p>
              <Button disabled>Upload Context File (Coming Soon)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

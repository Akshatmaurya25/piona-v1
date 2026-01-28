import { NextRequest, NextResponse } from "next/server"

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8000"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const body = await request.json()
    const { message, sessionId, conversationHistory } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Forward request to Python server
    const response = await fetch(`${PYTHON_SERVER_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        message,
        session_id: sessionId,
        conversation_history: conversationHistory,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Python server error:", errorText)
      return NextResponse.json(
        { error: "Failed to get response from chat server" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in chat:", error)

    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Chat server is not available. Please ensure the Python server is running.",
          details: "Run 'python main.py' in the python-server directory"
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/services/[serviceId]/feedback - List feedback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const supabase = createServerClient()

    // Get feedback with the associated chat messages
    const { data, error } = await supabase
      .from("feedback")
      .select(`
        *,
        chat_message:chat_history!chat_message_id (
          content,
          role,
          session_id
        )
      `)
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Also fetch the user message for each feedback by looking up the session
    const enrichedFeedback = await Promise.all(
      (data || []).map(async (item) => {
        // Get the user message from the same session that came before this assistant message
        const chatMsg = item.chat_message
        if (chatMsg?.session_id) {
          const { data: userMsg } = await supabase
            .from("chat_history")
            .select("content")
            .eq("session_id", chatMsg.session_id)
            .eq("role", "user")
            .lt("created_at", item.created_at)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          return {
            ...item,
            user_message: userMsg?.content || null,
            bot_response: chatMsg?.content || null,
          }
        }
        return {
          ...item,
          user_message: null,
          bot_response: chatMsg?.content || null,
        }
      })
    )

    return NextResponse.json(enrichedFeedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    )
  }
}

// POST /api/services/[serviceId]/feedback - Submit feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const body = await request.json()
    const { chatMessageId, feedbackType, correctionMessage, expectedResponse } = body

    if (!chatMessageId || !feedbackType) {
      return NextResponse.json(
        { error: "chatMessageId and feedbackType are required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        chat_message_id: chatMessageId,
        service_id: serviceId,
        feedback_type: feedbackType,
        correction_message: correctionMessage || null,
        expected_response: expectedResponse || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}

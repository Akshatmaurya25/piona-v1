import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/services/[serviceId]/sources/[sourceId]/chunks - Get all chunks for a source
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; sourceId: string }> }
) {
  try {
    const { serviceId, sourceId } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("chunks")
      .select("id, content, chunk_index, row_reference, metadata, created_at")
      .eq("service_id", serviceId)
      .eq("source_id", sourceId)
      .order("chunk_index", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching chunks:", error)
    return NextResponse.json(
      { error: "Failed to fetch chunks" },
      { status: 500 }
    )
  }
}

// PUT /api/services/[serviceId]/sources/[sourceId]/chunks - Update chunk content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; sourceId: string }> }
) {
  try {
    const { serviceId, sourceId } = await params
    const body = await request.json()
    const supabase = createServerClient()

    // Expect body to be an array of { id, content } objects
    const updates: { id: string; content: string }[] = body.updates

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid request body - expected updates array" },
        { status: 400 }
      )
    }

    // Update each chunk
    const results = await Promise.all(
      updates.map(async (update) => {
        const { data, error } = await supabase
          .from("chunks")
          .update({ content: update.content })
          .eq("id", update.id)
          .eq("service_id", serviceId)
          .eq("source_id", sourceId)
          .select()
          .single()

        if (error) throw error
        return data
      })
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error("Error updating chunks:", error)
    return NextResponse.json(
      { error: "Failed to update chunks" },
      { status: 500 }
    )
  }
}

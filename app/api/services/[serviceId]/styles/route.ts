import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/services/[serviceId]/styles - List writing styles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("writing_styles")
      .select("*")
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching styles:", error)
    return NextResponse.json(
      { error: "Failed to fetch styles" },
      { status: 500 }
    )
  }
}

// POST /api/services/[serviceId]/styles - Create writing style
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const body = await request.json()
    const { name, description, tone, guidelines } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if this should be the default (first style)
    const { count } = await supabase
      .from("writing_styles")
      .select("*", { count: "exact", head: true })
      .eq("service_id", serviceId)

    const { data, error } = await supabase
      .from("writing_styles")
      .insert({
        service_id: serviceId,
        name,
        description: description || null,
        tone: tone || null,
        guidelines: guidelines || null,
        is_default: count === 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating style:", error)
    return NextResponse.json(
      { error: "Failed to create style" },
      { status: 500 }
    )
  }
}

// PUT /api/services/[serviceId]/styles - Update a style
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const body = await request.json()
    const { id, name, description, tone, guidelines, is_default } = body

    if (!id) {
      return NextResponse.json({ error: "Style ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // If setting as default, unset all others first
    if (is_default) {
      await supabase
        .from("writing_styles")
        .update({ is_default: false })
        .eq("service_id", serviceId)
    }

    const { data, error } = await supabase
      .from("writing_styles")
      .update({
        name,
        description: description || null,
        tone: tone || null,
        guidelines: guidelines || null,
        is_default: is_default ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("service_id", serviceId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating style:", error)
    return NextResponse.json(
      { error: "Failed to update style" },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[serviceId]/styles - Delete a style
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const { searchParams } = new URL(request.url)
    const styleId = searchParams.get("styleId")

    if (!styleId) {
      return NextResponse.json({ error: "Style ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if deleting the default style
    const { data: style } = await supabase
      .from("writing_styles")
      .select("is_default")
      .eq("id", styleId)
      .single()

    const { error } = await supabase
      .from("writing_styles")
      .delete()
      .eq("id", styleId)
      .eq("service_id", serviceId)

    if (error) throw error

    // If deleted the default, set the first remaining as default
    if (style?.is_default) {
      const { data: remaining } = await supabase
        .from("writing_styles")
        .select("id")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: true })
        .limit(1)

      if (remaining && remaining.length > 0) {
        await supabase
          .from("writing_styles")
          .update({ is_default: true })
          .eq("id", remaining[0].id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting style:", error)
    return NextResponse.json(
      { error: "Failed to delete style" },
      { status: 500 }
    )
  }
}

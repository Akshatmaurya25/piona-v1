import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/services/[serviceId]/sources - List sources for a service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[serviceId]/sources?sourceId=xxx - Delete a source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get("sourceId")

    if (!sourceId) {
      return NextResponse.json({ error: "Source ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the source to find the file path
    const { data: source, error: fetchError } = await supabase
      .from("sources")
      .select("file_path")
      .eq("id", sourceId)
      .eq("service_id", serviceId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Source not found" }, { status: 404 })
      }
      throw fetchError
    }

    // Delete from storage
    if (source?.file_path) {
      await supabase.storage.from("source-files").remove([source.file_path])
    }

    // Delete chunks associated with this source (cascade should handle this, but just in case)
    await supabase.from("chunks").delete().eq("source_id", sourceId)

    // Delete the source record
    const { error: deleteError } = await supabase
      .from("sources")
      .delete()
      .eq("id", sourceId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting source:", error)
    return NextResponse.json(
      { error: "Failed to delete source" },
      { status: 500 }
    )
  }
}

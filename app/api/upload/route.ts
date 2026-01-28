import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const serviceId = formData.get("serviceId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    let fileType: string
    if (fileName.endsWith(".csv")) {
      fileType = "csv"
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      fileType = "excel"
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Only CSV and Excel files are supported." },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Generate unique file path
    const sourceId = crypto.randomUUID()
    const filePath = `${serviceId}/${sourceId}/${file.name}`

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from("source-files")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw uploadError
    }

    // Create source record
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .insert({
        id: sourceId,
        service_id: serviceId,
        name: file.name,
        file_type: fileType,
        file_path: filePath,
        file_size: file.size,
        status: "pending",
      })
      .select()
      .single()

    if (sourceError) {
      // Clean up uploaded file if source creation fails
      await supabase.storage.from("source-files").remove([filePath])
      throw sourceError
    }

    // Trigger Python server to process the file
    try {
      const processResponse = await fetch(`${PYTHON_SERVER_URL}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_id: sourceId,
          service_id: serviceId,
          file_path: filePath,
          file_type: fileType,
        }),
      })

      if (!processResponse.ok) {
        console.error("Python server error:", await processResponse.text())
        // Update source status to failed
        await supabase
          .from("sources")
          .update({ status: "failed", error_message: "Failed to start processing" })
          .eq("id", sourceId)
      }
    } catch (pythonError) {
      console.error("Failed to connect to Python server:", pythonError)
      // Update source status - processing will need to be triggered manually
      await supabase
        .from("sources")
        .update({
          status: "pending",
          error_message: "Python server unavailable. Processing pending."
        })
        .eq("id", sourceId)
    }

    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

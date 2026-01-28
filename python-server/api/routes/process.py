import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import ProcessFileRequest, ProcessingStatus
from services.database import get_supabase, create_supabase, update_source_status, save_chunks
from services.file_processor import FileProcessor
from services.embedding import generate_embeddings_batch

logger = logging.getLogger("piona.process")

router = APIRouter()


async def process_file_task(
    source_id: str,
    service_id: str,
    file_path: str,
    file_type: str,
    chunk_size: int,
    chunk_overlap: int
):
    """Background task to process a file"""
    logger.info(f"📦 Processing: {file_path}")

    # Fresh client for background task
    bg_client = create_supabase()

    try:
        update_source_status(source_id, "processing", client=bg_client)

        # Download file
        file_response = bg_client.storage.from_("source-files").download(file_path)
        if not file_response:
            raise Exception("Failed to download file")
        logger.info(f"   Downloaded: {len(file_response)} bytes")

        # Process into chunks
        processor = FileProcessor(chunk_size=chunk_size, chunk_overlap=chunk_overlap)

        if file_type == "csv":
            chunks = processor.process_csv(file_response)
        elif file_type in ["excel", "xlsx", "xls"]:
            chunks = processor.process_excel(file_response)
        else:
            raise Exception(f"Unsupported file type: {file_type}")

        if not chunks:
            raise Exception("No chunks created from file")
        logger.info(f"   Chunks: {len(chunks)}")

        # Generate embeddings
        texts = [chunk["content"] for chunk in chunks]
        embeddings = generate_embeddings_batch(texts)
        logger.info(f"   Embeddings: {len(embeddings)}")

        # Add embeddings to chunks
        for chunk, embedding in zip(chunks, embeddings):
            chunk["embedding"] = embedding

        # Save to database
        chunks_created = save_chunks(chunks, source_id, service_id, client=bg_client)

        # Update metadata
        metadata = processor.get_file_metadata(file_response, file_type)
        metadata["chunks_created"] = chunks_created

        update_source_status(source_id, "completed", metadata=metadata, client=bg_client)
        logger.info(f"   ✅ Completed: {chunks_created} chunks")

    except Exception as e:
        logger.error(f"   ❌ Failed: {str(e)}")
        update_source_status(source_id, "failed", error_message=str(e), client=bg_client)


@router.post("/process", response_model=ProcessingStatus)
async def process_file(request: ProcessFileRequest, background_tasks: BackgroundTasks):
    """Start processing a file (runs in background)"""
    logger.info(f"📤 Process request: {request.file_path}")

    try:
        supabase = get_supabase()
        source = supabase.table("sources").select("*").eq("id", request.source_id).single().execute()

        if not source.data:
            raise HTTPException(status_code=404, detail="Source not found")

        background_tasks.add_task(
            process_file_task,
            request.source_id,
            request.service_id,
            request.file_path,
            request.file_type,
            request.chunk_size,
            request.chunk_overlap
        )

        return ProcessingStatus(
            source_id=request.source_id,
            status="processing",
            chunks_created=0
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Process request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/process/{source_id}/status", response_model=ProcessingStatus)
async def get_processing_status(source_id: str):
    """Get the processing status of a source"""
    try:
        supabase = get_supabase()
        source = supabase.table("sources").select("*").eq("id", source_id).single().execute()

        if not source.data:
            raise HTTPException(status_code=404, detail="Source not found")

        chunks_result = supabase.table("chunks").select("id", count="exact").eq("source_id", source_id).execute()

        return ProcessingStatus(
            source_id=source_id,
            status=source.data["status"],
            chunks_created=chunks_result.count or 0,
            error_message=source.data.get("error_message")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

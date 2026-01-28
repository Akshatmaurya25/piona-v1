import json
import logging
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

logger = logging.getLogger("piona.database")

_supabase_client: Client = None


def get_supabase() -> Client:
    """Get or create Supabase client singleton"""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("Supabase credentials not configured")
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized")
    return _supabase_client


def create_supabase() -> Client:
    """Create a fresh Supabase client (use in background tasks / threads)"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase credentials not configured")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def update_source_status(source_id: str, status: str, error_message: str = None, metadata: dict = None, client: Client = None):
    """Update source processing status"""
    supabase = client or get_supabase()
    update_data = {"status": status}
    if error_message:
        update_data["error_message"] = error_message
        logger.error(f"   Source error: {error_message}")
    if metadata:
        update_data["metadata"] = json.loads(json.dumps(metadata, default=str))

    supabase.table("sources").update(update_data).eq("id", source_id).execute()
    logger.info(f"   Source status: {status}")


def save_chunks(chunks: list, source_id: str, service_id: str, client: Client = None):
    """Save chunks with embeddings to database"""
    logger.info(f"💾 Saving {len(chunks)} chunks...")
    supabase = client or get_supabase()

    chunk_records = []
    for i, chunk in enumerate(chunks):
        chunk_records.append({
            "source_id": source_id,
            "service_id": service_id,
            "content": chunk["content"],
            "embedding": chunk["embedding"],
            "chunk_index": i,
            "row_reference": chunk.get("row_reference"),
            "metadata": chunk.get("metadata", {})
        })

    # Insert in batches of 100
    batch_size = 100
    for i in range(0, len(chunk_records), batch_size):
        batch = chunk_records[i:i + batch_size]
        supabase.table("chunks").insert(batch).execute()

    logger.info(f"   ✅ Saved {len(chunk_records)} chunks")
    return len(chunk_records)


def get_service(service_id: str) -> dict:
    """Get service by ID"""
    supabase = get_supabase()
    result = supabase.table("services").select("*").eq("id", service_id).single().execute()
    return result.data


def get_writing_style(service_id: str) -> dict:
    """Get default writing style for service"""
    supabase = get_supabase()
    result = supabase.table("writing_styles").select("*").eq("service_id", service_id).eq("is_default", True).execute()
    if result.data:
        return result.data[0]
    return None


def save_chat_message(service_id: str, session_id: str, role: str, content: str,
                      prompt_used: str = None, context_used: str = None, chunks_used: list = None):
    """Save chat message to history"""
    supabase = get_supabase()
    supabase.table("chat_history").insert({
        "service_id": service_id,
        "session_id": session_id,
        "role": role,
        "content": content,
        "prompt_used": prompt_used,
        "context_used": context_used,
        "chunks_used": chunks_used or []
    }).execute()

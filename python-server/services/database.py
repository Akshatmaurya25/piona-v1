import json
import logging
import httpx
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

logger = logging.getLogger("piona.database")

_supabase_client: Client = None


def get_supabase() -> Client:
    """Get or create Supabase client singleton with proper timeout config"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = _create_configured_client()
    return _supabase_client


def _create_configured_client() -> Client:
    """Create Supabase client with optimized httpx settings"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase credentials not configured")

    # Configure httpx with longer timeouts and keep-alive
    timeout = httpx.Timeout(
        connect=10.0,    # Connection timeout
        read=30.0,       # Read timeout (important for RPC calls)
        write=10.0,      # Write timeout
        pool=10.0        # Pool timeout
    )

    # Configure connection limits for pooling
    limits = httpx.Limits(
        max_keepalive_connections=5,
        max_connections=10,
        keepalive_expiry=30.0  # Keep connections alive for 30 seconds
    )

    # Create client with custom options
    options = ClientOptions(
        headers={
            "Connection": "keep-alive"
        }
    )
    client = create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        options=options
    )

    # Override the internal httpx client settings
    # Access the postgrest client and update its httpx client
    if hasattr(client, 'postgrest') and hasattr(client.postgrest, '_session'):
        client.postgrest._session = httpx.Client(
            timeout=timeout,
            limits=limits,
            http2=False  # Disable HTTP/2 to avoid StreamReset errors
        )

    logger.info("Supabase client initialized with optimized connection settings")
    return client


def create_supabase() -> Client:
    """Create a fresh Supabase client (use in background tasks / threads)"""
    return _create_configured_client()


def init_database():
    """Initialize database connection at startup - call this from main.py"""
    global _supabase_client
    logger.info("Initializing database connection...")
    _supabase_client = _create_configured_client()

    # Warm up connection with a simple query
    try:
        result = _supabase_client.table("services").select("id").limit(1).execute()
        logger.info("Database connection verified")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def reset_connection():
    """Reset the database connection if it becomes stale"""
    global _supabase_client
    logger.warning("Resetting database connection...")
    _supabase_client = None
    return get_supabase()


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
    logger.info(f"Saving {len(chunks)} chunks...")
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

    logger.info(f"   Saved {len(chunk_records)} chunks")
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
                      prompt_used: str = None, context_used: str = None, chunks_used: list = None) -> str:
    """Save chat message to history and return the message ID"""
    supabase = get_supabase()
    result = supabase.table("chat_history").insert({
        "service_id": service_id,
        "session_id": session_id,
        "role": role,
        "content": content,
        "prompt_used": prompt_used,
        "context_used": context_used,
        "chunks_used": chunks_used or []
    }).execute()
    return result.data[0]["id"] if result.data else None

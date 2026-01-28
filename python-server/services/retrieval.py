import json
import logging
import time
from typing import List, Dict, Any
from services.database import get_supabase, reset_connection
from services.embedding import generate_embedding
from config import MAX_CONTEXT_CHUNKS, SIMILARITY_THRESHOLD

logger = logging.getLogger("piona.retrieval")

MAX_RETRIES = 2
RETRY_DELAY = 1.0  # seconds


def _execute_with_retry(operation, operation_name: str):
    """Execute a database operation with retry on connection failure"""
    last_error = None

    for attempt in range(MAX_RETRIES + 1):
        try:
            return operation()
        except Exception as e:
            last_error = e
            error_msg = str(e).lower()

            # Check if it's a connection/timeout error
            is_connection_error = any(keyword in error_msg for keyword in [
                "timeout", "connection", "reset", "stream", "closed", "refused"
            ])

            if is_connection_error and attempt < MAX_RETRIES:
                logger.warning(f"   {operation_name} failed (attempt {attempt + 1}), retrying...")
                reset_connection()  # Reset the connection
                time.sleep(RETRY_DELAY)
            else:
                raise last_error

    raise last_error


def retrieve_relevant_chunks(
    service_id: str,
    query: str,
    max_chunks: int = None,
    threshold: float = None
) -> List[Dict[str, Any]]:
    """Retrieve relevant chunks using vector similarity search"""
    logger.info(f"🔍 Retrieving chunks for: \"{query[:50]}...\"")
    logger.info(f"   Service ID: {service_id}")

    if max_chunks is None:
        max_chunks = MAX_CONTEXT_CHUNKS
    if threshold is None:
        threshold = SIMILARITY_THRESHOLD

    logger.info(f"   Threshold: {threshold}, Max chunks: {max_chunks}")

    try:
        # First, check if there are any chunks for this service
        supabase = get_supabase()

        def count_chunks():
            return supabase.table("chunks").select("id", count="exact").eq("service_id", service_id).execute()

        count_result = _execute_with_retry(count_chunks, "Count chunks")
        total_chunks = count_result.count if hasattr(count_result, 'count') else len(count_result.data or [])
        logger.info(f"   Total chunks for service: {total_chunks}")

        if total_chunks == 0:
            logger.warning("   ⚠️ No chunks found for this service. Upload and process a source file first.")
            return []

        # Generate embedding for the query
        query_embedding = generate_embedding(query)
        logger.info(f"   Query embedding generated ({len(query_embedding)} dimensions)")

        # Call match_chunks RPC with retry
        def call_match_chunks():
            return supabase.rpc(
                "match_chunks",
                {
                    "query_embedding": query_embedding,
                    "match_service_id": service_id,
                    "match_threshold": threshold,
                    "match_count": max_chunks
                }
            ).execute()

        result = _execute_with_retry(call_match_chunks, "RPC match_chunks")

        chunks = []
        for item in result.data or []:
            chunks.append({
                "id": item["id"],
                "content": item["content"],
                "metadata": item.get("metadata", {}),
                "similarity": item["similarity"]
            })

        logger.info(f"   ✅ Found {len(chunks)} chunks above threshold {threshold}")
        if chunks:
            sims = [f"{c['similarity']:.2f}" for c in chunks]
            logger.info(f"   Similarities: {sims}")
        elif total_chunks > 0:
            logger.warning(f"   ⚠️ {total_chunks} chunks exist but none matched above threshold {threshold}")
            logger.info("   Trying fallback method with lower threshold...")
            return retrieve_chunks_fallback(service_id, query_embedding, max_chunks, 0.1)

        return chunks

    except Exception as e:
        error_msg = str(e)
        logger.error(f"   ❌ Retrieval failed: {error_msg}")

        # Check if it's a function not found error
        if "match_chunks" in error_msg.lower() or "function" in error_msg.lower() or "does not exist" in error_msg.lower():
            logger.error("   💡 The match_chunks function may not exist in your database.")
            logger.error("   Please run the schema.sql file in Supabase SQL Editor.")
            logger.info("   Trying fallback method...")
            try:
                query_embedding = generate_embedding(query)
                return retrieve_chunks_fallback(service_id, query_embedding, max_chunks, threshold)
            except Exception as fallback_error:
                logger.error(f"   Fallback also failed: {fallback_error}")
                return []

        # Check if it's a timeout/connection error - try fallback
        if any(keyword in error_msg.lower() for keyword in ["stream", "reset", "timeout", "connection"]):
            logger.error("   💡 Connection timeout. Trying fallback method...")
            try:
                query_embedding = generate_embedding(query)
                return retrieve_chunks_fallback(service_id, query_embedding, max_chunks, threshold)
            except Exception as fallback_error:
                logger.error(f"   Fallback also failed: {fallback_error}")
                return []

        return []


def retrieve_chunks_fallback(
    service_id: str,
    query_embedding: List[float],
    max_chunks: int,
    threshold: float
) -> List[Dict[str, Any]]:
    """Fallback: fetch all chunks and compute similarity in Python"""
    logger.info("   Using fallback retrieval (local similarity computation)")

    try:
        supabase = get_supabase()

        # Fetch all chunks for this service with retry
        def fetch_chunks():
            return supabase.table("chunks").select("id, content, metadata, embedding").eq("service_id", service_id).execute()

        result = _execute_with_retry(fetch_chunks, "Fetch chunks")

        if not result.data:
            logger.warning("   No chunks found for this service")
            return []

        logger.info(f"   Fetched {len(result.data)} chunks, computing similarities...")

        # Compute cosine similarity
        import numpy as np
        query_vec = np.array(query_embedding)
        query_norm = np.linalg.norm(query_vec)

        scored_chunks = []
        for chunk in result.data:
            embedding_data = chunk.get("embedding")
            if embedding_data:
                # Handle embedding stored as JSON string
                if isinstance(embedding_data, str):
                    try:
                        embedding_data = json.loads(embedding_data)
                    except json.JSONDecodeError:
                        logger.warning(f"   Failed to parse embedding for chunk {chunk.get('id')}")
                        continue
                chunk_vec = np.array(embedding_data)
                chunk_norm = np.linalg.norm(chunk_vec)
                if query_norm > 0 and chunk_norm > 0:
                    similarity = float(np.dot(query_vec, chunk_vec) / (query_norm * chunk_norm))
                    if similarity >= threshold:
                        scored_chunks.append({
                            "id": chunk["id"],
                            "content": chunk["content"],
                            "metadata": chunk.get("metadata", {}),
                            "similarity": similarity
                        })

        # Sort by similarity and take top N
        scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
        chunks = scored_chunks[:max_chunks]

        logger.info(f"   ✅ Fallback found {len(chunks)} chunks above threshold")
        if chunks:
            sims = [f"{c['similarity']:.2f}" for c in chunks]
            logger.info(f"   Similarities: {sims}")

        return chunks

    except Exception as e:
        logger.error(f"   ❌ Fallback also failed: {e}")
        return []


def build_context(chunks: List[Dict[str, Any]]) -> str:
    """Build context string from retrieved chunks"""
    if not chunks:
        logger.warning("   ⚠️ No chunks to build context")
        return "No relevant information found in the knowledge base."

    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(f"[Source {i}]: {chunk['content']}")

    context = "\n\n".join(context_parts)
    logger.info(f"   Context: {len(context)} chars from {len(chunks)} sources")
    return context

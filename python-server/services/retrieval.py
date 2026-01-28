import logging
from typing import List, Dict, Any
from services.database import get_supabase
from services.embedding import generate_embedding
from config import MAX_CONTEXT_CHUNKS, SIMILARITY_THRESHOLD

logger = logging.getLogger("piona.retrieval")


def retrieve_relevant_chunks(
    service_id: str,
    query: str,
    max_chunks: int = None,
    threshold: float = None
) -> List[Dict[str, Any]]:
    """Retrieve relevant chunks using vector similarity search"""
    logger.info(f"🔍 Retrieving chunks for: \"{query[:50]}...\"")

    if max_chunks is None:
        max_chunks = MAX_CONTEXT_CHUNKS
    if threshold is None:
        threshold = SIMILARITY_THRESHOLD

    try:
        # Generate embedding for the query
        query_embedding = generate_embedding(query)
        logger.info(f"   Query embedding generated")

        # Call the match_chunks function in Supabase
        supabase = get_supabase()

        # Using RPC to call the custom function
        result = supabase.rpc(
            "match_chunks",
            {
                "query_embedding": query_embedding,
                "match_service_id": service_id,
                "match_threshold": threshold,
                "match_count": max_chunks
            }
        ).execute()

        chunks = []
        for item in result.data or []:
            chunks.append({
                "id": item["id"],
                "content": item["content"],
                "metadata": item.get("metadata", {}),
                "similarity": item["similarity"]
            })

        logger.info(f"   ✅ Found {len(chunks)} chunks")
        if chunks:
            sims = [f"{c['similarity']:.2f}" for c in chunks]
            logger.info(f"   Similarities: {sims}")

        return chunks

    except Exception as e:
        error_msg = str(e)
        logger.error(f"   ❌ Retrieval failed: {error_msg}")

        # Check if it's a function not found error
        if "match_chunks" in error_msg.lower() or "function" in error_msg.lower():
            logger.error("   💡 The match_chunks function may not exist in your database.")
            logger.error("   Please run the schema.sql file in Supabase SQL Editor.")

        # Check if it's a timeout/connection error
        if "stream" in error_msg.lower() or "reset" in error_msg.lower() or "timeout" in error_msg.lower():
            logger.error("   💡 Connection timeout. Trying fallback method...")
            return retrieve_chunks_fallback(service_id, query_embedding, max_chunks, threshold)

        raise


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

        # Fetch all chunks for this service
        result = supabase.table("chunks").select("id, content, metadata, embedding").eq("service_id", service_id).execute()

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
            if chunk.get("embedding"):
                chunk_vec = np.array(chunk["embedding"])
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

import logging
from openai import OpenAI
from typing import List
from config import OPENAI_API_KEY, EMBEDDING_MODEL

logger = logging.getLogger("piona.embedding")

_openai_client: OpenAI = None


def get_openai() -> OpenAI:
    """Get or create OpenAI client singleton"""
    global _openai_client
    if _openai_client is None:
        if not OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        _openai_client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("OpenAI client initialized")
    return _openai_client


def generate_embedding(text: str) -> List[float]:
    """Generate embedding for a single text"""
    client = get_openai()
    response = client.embeddings.create(
        input=text,
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding


def generate_embeddings_batch(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """Generate embeddings for multiple texts in batches"""
    logger.info(f"🧮 Generating {len(texts)} embeddings...")
    client = get_openai()
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            input=batch,
            model=EMBEDDING_MODEL
        )
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

    logger.info(f"   ✅ Generated {len(all_embeddings)} embeddings")
    return all_embeddings

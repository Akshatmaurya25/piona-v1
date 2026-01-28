import logging
from typing import List, Dict, Optional
from services.embedding import get_openai
from config import CHAT_MODEL

logger = logging.getLogger("piona.llm")


def generate_response(
    query: str,
    context: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    style_guidelines: Optional[str] = None
) -> tuple[str, str]:
    """
    Generate a response using GPT-4o with RAG context
    """
    logger.info(f"🤖 Generating response (context: {len(context)} chars)")

    try:
        client = get_openai()

        # Build the system prompt
        system_prompt = """You are a helpful AI assistant that answers questions based on the provided context.

INSTRUCTIONS:
- Answer the user's question using ONLY the information from the provided context
- If the context doesn't contain enough information to answer, say so clearly
- When listing items that match criteria (e.g., "items under $10", "vegetarian options"), include ALL items from the context that match - do not omit any
- Be thorough and complete in your responses - do not skip relevant information
- Cite which source(s) you used when relevant
- Do not make up information not present in the context"""

        if style_guidelines:
            system_prompt += f"\n\nWRITING STYLE GUIDELINES:\n{style_guidelines}"

        # Build the user message with context
        user_message = f"""CONTEXT:
{context}

USER QUESTION:
{query}

Please answer based on the context provided above."""

        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-6:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        messages.append({"role": "user", "content": user_message})

        # Generate response
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            temperature=0.3,  # Lower temperature for more consistent, factual responses
            max_tokens=1024
        )

        answer = response.choices[0].message.content

        if hasattr(response, 'usage') and response.usage:
            logger.info(f"   Tokens: {response.usage.total_tokens}")

        logger.info(f"   ✅ Generated {len(answer)} chars")

        # Build full prompt for debugging
        full_prompt = f"System: {system_prompt}\n\nUser: {user_message}"

        return answer, full_prompt

    except Exception as e:
        logger.error(f"   ❌ LLM failed: {e}")
        raise

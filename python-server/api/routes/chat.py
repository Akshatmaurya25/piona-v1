import logging
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, ChunkInfo
from services.database import get_service, get_writing_style, save_chat_message
from services.retrieval import retrieve_relevant_chunks, build_context
from services.llm import generate_response
import uuid

logger = logging.getLogger("piona.chat")

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the chatbot and get a RAG-powered response
    """
    logger.info(f"💬 Chat: \"{request.message[:50]}...\"")

    try:
        session_id = request.session_id or str(uuid.uuid4())

        # Step 1: Verify service
        service = get_service(request.service_id)
        if not service:
            logger.error(f"Service not found: {request.service_id}")
            raise HTTPException(status_code=404, detail="Service not found")
        logger.info(f"   Service: {service.get('name')}")

        # Step 2: Get writing style
        style_guidelines = request.style_guidelines
        if not style_guidelines:
            style = get_writing_style(request.service_id)
            if style:
                style_guidelines = f"Tone: {style.get('tone', 'professional')}\n{style.get('guidelines', '')}"
                logger.info(f"   Style: {style.get('name')}")

        # Step 3: Save user message
        save_chat_message(
            service_id=request.service_id,
            session_id=session_id,
            role="user",
            content=request.message
        )

        # Step 4: Retrieve chunks
        chunks = retrieve_relevant_chunks(
            service_id=request.service_id,
            query=request.message
        )

        # Step 5: Build context
        context = build_context(chunks)

        # Step 6: Generate response
        response_text, prompt_used = generate_response(
            query=request.message,
            context=context,
            conversation_history=request.conversation_history,
            style_guidelines=style_guidelines
        )

        # Convert chunks to response format
        chunk_infos = [
            ChunkInfo(
                id=chunk["id"],
                content=chunk["content"],
                similarity=chunk["similarity"],
                metadata=chunk.get("metadata", {})
            )
            for chunk in chunks
        ]

        # Step 7: Save response
        save_chat_message(
            service_id=request.service_id,
            session_id=session_id,
            role="assistant",
            content=response_text,
            prompt_used=prompt_used,
            context_used=context,
            chunks_used=[c.id for c in chunk_infos]
        )

        logger.info(f"   ✅ Response: \"{response_text[:50]}...\"")

        return ChatResponse(
            response=response_text,
            prompt_used=prompt_used,
            context_used=context,
            chunks_used=chunk_infos,
            session_id=session_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Chat failed: {str(e)}")
        logger.exception("Traceback:")
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================
# Request Models
# ============================================

class ProcessFileRequest(BaseModel):
    source_id: str
    service_id: str
    file_path: str
    file_type: str  # 'csv' or 'excel'
    chunk_size: int = 500
    chunk_overlap: int = 50


class ChatRequest(BaseModel):
    service_id: str
    message: str
    session_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    style_guidelines: Optional[str] = None


class ReprocessRequest(BaseModel):
    source_id: str
    chunk_size: int = 500
    chunk_overlap: int = 50


# ============================================
# Response Models
# ============================================

class ProcessingStatus(BaseModel):
    source_id: str
    status: str  # 'processing', 'completed', 'failed'
    chunks_created: int = 0
    error_message: Optional[str] = None


class ChunkInfo(BaseModel):
    id: str
    content: str
    similarity: float
    metadata: Dict[str, Any] = {}


class ChatResponse(BaseModel):
    response: str
    prompt_used: str
    context_used: str
    chunks_used: List[ChunkInfo]
    session_id: str
    message_id: Optional[str] = None  # ID of the assistant message for feedback


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime

import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import health, process, chat
from config import DEBUG


logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s',
    datefmt='%H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("hpack").setLevel(logging.WARNING)
logging.getLogger("h2").setLevel(logging.WARNING)
logging.getLogger("h11").setLevel(logging.WARNING)
logging.getLogger("postgrest").setLevel(logging.WARNING)

logger = logging.getLogger("piona.main")

# Create FastAPI app
app = FastAPI(
    title="Piona RAG Server",
    description="RAG processing server for Piona - RAG as a Service",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://piona.fun",
         "https://www.piona.fun"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(process.router, prefix="/api", tags=["Processing"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


@app.on_event("startup")
async def startup_event():
    from config import HOST, PORT, EMBEDDING_MODEL, CHAT_MODEL, MAX_CONTEXT_CHUNKS, SIMILARITY_THRESHOLD, SUPABASE_URL, OPENAI_API_KEY
    from services.database import init_database

    logger.info("=" * 60)
    logger.info("🚀 PIONA RAG SERVER STARTING")
    logger.info("=" * 60)

    # Initialize database connection
    db_connected = init_database()
    if not db_connected:
        logger.warning("Database connection failed - will retry on first request")

    logger.info(f"Debug mode: {DEBUG}")
    logger.info(f"Server: {HOST}:{PORT}")
    logger.info(f"Docs: /docs" if DEBUG else "Docs: disabled")
    logger.info("-" * 60)
    logger.info("Configuration:")
    logger.info(f"  Supabase URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "  Supabase URL: NOT SET ⚠️")
    logger.info(f"  OpenAI API Key: {'***' + OPENAI_API_KEY[-4:] if OPENAI_API_KEY else 'NOT SET ⚠️'}")
    logger.info(f"  Embedding model: {EMBEDDING_MODEL}")
    logger.info(f"  Chat model: {CHAT_MODEL}")
    logger.info(f"  Max context chunks: {MAX_CONTEXT_CHUNKS}")
    logger.info(f"  Similarity threshold: {SIMILARITY_THRESHOLD}")
    logger.info("=" * 60)


@app.get("/")
async def root():
    return {
        "name": "Piona RAG Server",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if DEBUG else "disabled"
    }


if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    )

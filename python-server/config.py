import os
from dotenv import load_dotenv

# Load environment variables from parent .env.local
load_dotenv(dotenv_path="../.env.local")

# Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Embedding settings
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

# Chat settings
CHAT_MODEL = "gpt-4o"
MAX_CONTEXT_CHUNKS = 5
SIMILARITY_THRESHOLD = 0.3  # Lower threshold for better recall

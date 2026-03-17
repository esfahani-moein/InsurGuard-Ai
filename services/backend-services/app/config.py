from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

# All selectable Gemini models — default is flash (fast + cheap)
AVAILABLE_MODELS: list[dict] = [
    {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "description": "Fast, capable, and recommended for most tasks (default)",
        "is_default": True,
    },
    {
        "id": "gemini-2.5-flash-lite",
        "name": "Gemini 2.5 Flash Lite",
        "description": "Ultra-fast, lower cost",
        "is_default": False,
    },
    {
        "id": "gemini-flash-latest",
        "name": "Gemini Flash Latest",
        "description": "Rolling latest flash model",
        "is_default": False,
    },
    {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "description": "Higher capability for complex reasoning",
        "is_default": False,
    },
    {
        "id": "gemini-pro-latest",
        "name": "Gemini Pro Latest",
        "description": "Rolling latest pro model",
        "is_default": False,
    },
]

DEFAULT_MODEL_ID = "gemini-2.5-flash"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Google Gemini
    gemini_api_key: str = ""
    gemini_model: str = DEFAULT_MODEL_ID
    gemini_embedding_model: str = "text-embedding-004"

    # App
    app_env: str = "development"
    log_level: str = "info"
    allowed_origins: str = "http://localhost:3000,http://frontend:3000"

    # File upload
    upload_dir: str = "/tmp/insurguard_uploads"
    max_upload_size_mb: int = 50

    # ChromaDB
    chroma_persist_dir: str = "/data/chroma"
    chroma_collection_name: str = "insurguard_docs"

    # RAG
    rag_chunk_size: int = 1000
    rag_chunk_overlap: int = 200
    rag_retrieval_k: int = 5

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()

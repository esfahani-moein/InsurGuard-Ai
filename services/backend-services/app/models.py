from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


def _new_id() -> str:
    return str(uuid.uuid4())


# ── Chat ─────────────────────────────────────────────────────────────────────

class Attachment(BaseModel):
    name: str
    type: str
    content: str  # base64-encoded or plain text


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    attachments: Optional[list[Attachment]] = None
    model: Optional[str] = None  # Gemini model ID; defaults to gemini-2.0-flash


class GeminiModel(BaseModel):
    id: str
    name: str
    description: str
    is_default: bool


class ModelsResponse(BaseModel):
    models: list[GeminiModel]
    default: str


class ChatResponse(BaseModel):
    id: str = Field(default_factory=_new_id)
    conversation_id: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


# ── Dashboard ─────────────────────────────────────────────────────────────────

class ActivityItem(BaseModel):
    id: str = Field(default_factory=_new_id)
    type: Literal["query", "upload", "analysis", "export"]
    description: str
    timestamp: str
    status: Literal["success", "warning", "error"]


class DashboardStats(BaseModel):
    total_documents: int
    total_queries: int
    coverage_checks: int
    risk_assessments: int
    avg_response_time_ms: float
    accuracy_rate: float
    recent_activity: list[ActivityItem]


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    id: str = Field(default_factory=_new_id)
    url: str
    filename: str
    size: int
    mime_type: str
    ingested: bool = False


# ── Documents (RAG) ───────────────────────────────────────────────────────────

class DocumentItem(BaseModel):
    id: str
    filename: str
    size: int
    mime_type: str
    ingested: bool
    created_at: str


class DocumentListResponse(BaseModel):
    documents: list[DocumentItem]
    total: int


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    model: str

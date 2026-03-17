"""File upload endpoint with RAG ingestion."""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile

from app.config import get_settings
from app.models import DocumentItem, DocumentListResponse, UploadResponse
from app.services import rag_service
from app.services.document_store import (
    delete_document,
    list_documents,
    mark_ingested,
    register_document,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["upload"])

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
}


def _upload_dir() -> Path:
    d = Path(get_settings().upload_dir)
    d.mkdir(parents=True, exist_ok=True)
    return d


async def _ingest_background(file_path: str, doc_id: str, filename: str) -> None:
    try:
        await rag_service.ingest_document(file_path, doc_id, filename)
        mark_ingested(doc_id)
        logger.info("Background ingestion complete: %s", doc_id)
    except Exception:
        logger.exception("Background ingestion failed for %s", doc_id)


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile,
    background_tasks: BackgroundTasks,
) -> UploadResponse:
    settings = get_settings()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024

    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb} MB",
        )

    mime = file.content_type or "application/octet-stream"
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {mime}",
        )

    doc_id = str(uuid.uuid4())
    suffix = Path(file.filename or "upload").suffix
    dest = _upload_dir() / f"{doc_id}{suffix}"

    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)

    register_document(
        doc_id=doc_id,
        filename=file.filename or "upload",
        size=len(content),
        mime_type=mime,
        file_path=str(dest),
    )

    # Only ingest text/PDF files into the RAG pipeline (not raw images)
    if not mime.startswith("image/"):
        background_tasks.add_task(_ingest_background, str(dest), doc_id, file.filename or "upload")

    return UploadResponse(
        id=doc_id,
        url=f"/api/documents/{doc_id}",
        filename=file.filename or "upload",
        size=len(content),
        mime_type=mime,
        ingested=False,
    )


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents_endpoint() -> DocumentListResponse:
    docs = list_documents()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.delete("/documents/{doc_id}")
async def delete_document_endpoint(doc_id: str) -> dict:
    file_path = delete_document(doc_id)
    if file_path is None:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from ChromaDB
    await rag_service.delete_document_chunks(doc_id)

    # Remove file from disk
    try:
        os.remove(file_path)
    except OSError:
        pass

    return {"deleted": doc_id}

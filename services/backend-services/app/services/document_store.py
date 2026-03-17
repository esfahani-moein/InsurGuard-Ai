"""In-process document registry (persisted to a JSON file for simplicity)."""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Optional

from app.models import DocumentItem

logger = logging.getLogger(__name__)

_STORE_PATH = Path(os.environ.get("UPLOAD_DIR", "/tmp/insurguard_uploads")) / ".doc_registry.json"
_lock = Lock()


def _load() -> dict[str, dict]:
    if _STORE_PATH.exists():
        try:
            return json.loads(_STORE_PATH.read_text())
        except Exception:
            return {}
    return {}


def _save(data: dict[str, dict]) -> None:
    _STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    _STORE_PATH.write_text(json.dumps(data, indent=2))


def register_document(
    doc_id: str,
    filename: str,
    size: int,
    mime_type: str,
    file_path: str,
    ingested: bool = False,
) -> DocumentItem:
    with _lock:
        data = _load()
        now = datetime.now(timezone.utc).isoformat()
        data[doc_id] = {
            "id": doc_id,
            "filename": filename,
            "size": size,
            "mime_type": mime_type,
            "file_path": file_path,
            "ingested": ingested,
            "created_at": now,
        }
        _save(data)
    return DocumentItem(
        id=doc_id,
        filename=filename,
        size=size,
        mime_type=mime_type,
        ingested=ingested,
        created_at=now,
    )


def mark_ingested(doc_id: str) -> None:
    with _lock:
        data = _load()
        if doc_id in data:
            data[doc_id]["ingested"] = True
            _save(data)


def get_document(doc_id: str) -> Optional[dict]:
    with _lock:
        return _load().get(doc_id)


def list_documents() -> list[DocumentItem]:
    with _lock:
        data = _load()
    items = []
    for entry in sorted(data.values(), key=lambda x: x["created_at"], reverse=True):
        items.append(
            DocumentItem(
                id=entry["id"],
                filename=entry["filename"],
                size=entry["size"],
                mime_type=entry["mime_type"],
                ingested=entry["ingested"],
                created_at=entry["created_at"],
            )
        )
    return items


def delete_document(doc_id: str) -> Optional[str]:
    """Returns file_path if found, None if not."""
    with _lock:
        data = _load()
        entry = data.pop(doc_id, None)
        if entry:
            _save(data)
            return entry.get("file_path")
    return None


def get_stats() -> dict:
    with _lock:
        data = _load()
    total = len(data)
    ingested = sum(1 for d in data.values() if d.get("ingested"))
    return {"total_documents": total, "ingested_documents": ingested}

"""RAG pipeline: document ingestion, chunking, embedding, and retrieval via ChromaDB."""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from typing import BinaryIO

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import get_settings

logger = logging.getLogger(__name__)


def _get_chroma_client() -> chromadb.ClientAPI:
    settings = get_settings()
    os.makedirs(settings.chroma_persist_dir, exist_ok=True)
    return chromadb.PersistentClient(
        path=settings.chroma_persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def _get_collection() -> chromadb.Collection:
    settings = get_settings()
    client = _get_chroma_client()
    return client.get_or_create_collection(
        name=settings.chroma_collection_name,
        metadata={"hnsw:space": "cosine"},
    )


def _get_embeddings() -> GoogleGenerativeAIEmbeddings:
    settings = get_settings()
    return GoogleGenerativeAIEmbeddings(
        google_api_key=settings.gemini_api_key,
        model=settings.gemini_embedding_model,
    )


async def ingest_document(file_path: str, doc_id: str, filename: str) -> int:
    """Chunk, embed and store a document. Returns number of chunks stored."""
    settings = get_settings()
    path = Path(file_path)
    mime = _guess_mime(filename)

    if mime == "application/pdf":
        loader = PyPDFLoader(str(path))
        pages = loader.load()
    else:
        loader = TextLoader(str(path), encoding="utf-8", autodetect_encoding=True)
        pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.rag_chunk_size,
        chunk_overlap=settings.rag_chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(pages)

    if not chunks:
        logger.warning("No chunks produced for %s", filename)
        return 0

    embeddings = _get_embeddings()
    texts = [c.page_content for c in chunks]
    vectors = embeddings.embed_documents(texts)

    collection = _get_collection()
    ids = [f"{doc_id}__chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "filename": filename,
            "page": c.metadata.get("page", 0),
            "chunk_index": i,
        }
        for i, c in enumerate(chunks)
    ]

    collection.upsert(ids=ids, embeddings=vectors, documents=texts, metadatas=metadatas)
    logger.info("Ingested %d chunks for doc %s (%s)", len(chunks), doc_id, filename)
    return len(chunks)


async def retrieve_context(query: str) -> list[str]:
    """Return top-k relevant chunks for a query. Returns [] if no documents ingested."""
    settings = get_settings()
    collection = _get_collection()
    if collection.count() == 0:
        return []

    embeddings = _get_embeddings()
    query_vector = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=min(settings.rag_retrieval_k, collection.count()),
        include=["documents"],
    )
    docs = results.get("documents", [[]])[0]
    return [d for d in docs if d]


async def delete_document_chunks(doc_id: str) -> None:
    """Remove all chunks belonging to a document."""
    collection = _get_collection()
    results = collection.get(where={"doc_id": doc_id})
    if results and results.get("ids"):
        collection.delete(ids=results["ids"])
        logger.info("Deleted %d chunks for doc %s", len(results["ids"]), doc_id)


def _guess_mime(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return {
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }.get(ext, "text/plain")

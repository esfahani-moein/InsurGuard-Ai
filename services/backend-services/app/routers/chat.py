"""Chat endpoints: non-streaming, SSE streaming, and model listing."""

from __future__ import annotations

import json
import logging
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import AVAILABLE_MODELS, DEFAULT_MODEL_ID
from app.models import ChatRequest, ChatResponse, GeminiModel, ModelsResponse
from app.services import openai_service as gemini_service
from app.services import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


@router.get("/models", response_model=ModelsResponse)
async def list_models() -> ModelsResponse:
    """Return all available Gemini models."""
    return ModelsResponse(
        models=[GeminiModel(**m) for m in AVAILABLE_MODELS],
        default=DEFAULT_MODEL_ID,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Non-streaming chat completion."""
    conv_id = request.conversation_id or str(uuid.uuid4())
    try:
        context = await rag_service.retrieve_context(request.message)
        reply = await gemini_service.chat_complete(
            user_message=request.message,
            attachments=request.attachments,
            context_chunks=context or None,
            model_id=request.model,
        )
    except Exception as exc:
        logger.exception("Chat completion failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(conversation_id=conv_id, message=reply)


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Server-Sent Events streaming chat completion."""
    conv_id = request.conversation_id or str(uuid.uuid4())

    async def event_generator():
        try:
            context = await rag_service.retrieve_context(request.message)
            async for chunk in gemini_service.chat_stream(
                user_message=request.message,
                attachments=request.attachments,
                context_chunks=context or None,
                model_id=request.model,
            ):
                payload = json.dumps({"content": chunk, "conversation_id": conv_id})
                yield f"data: {payload}\n\n"
        except Exception as exc:
            logger.exception("Streaming chat failed")
            error_payload = json.dumps({"error": str(exc)})
            yield f"data: {error_payload}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

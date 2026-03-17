"""Google Gemini integration using the google-genai SDK (v1+)."""

from __future__ import annotations

import base64
import logging
from typing import AsyncIterator

from google import genai
from google.genai import types as genai_types

from app.config import AVAILABLE_MODELS, DEFAULT_MODEL_ID, get_settings
from app.models import Attachment

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are InsurGuard AI, an expert insurance analysis assistant.
You specialize in:
- Insurance policy analysis and coverage gap detection
- Legal compliance review for insurance documents
- Risk assessment and flagging
- Plain-language explanation of complex policy terms
- Comparison of coverage across multiple policies

Be thorough, precise, and always cite specific policy sections when available.
Format responses in markdown for clarity. If documents are attached, analyze them directly.
Always recommend consulting a licensed insurance professional for binding advice."""


def _get_client() -> genai.Client:
    settings = get_settings()
    return genai.Client(api_key=settings.gemini_api_key)


def _resolve_model(model_id: str | None) -> str:
    """Validate and return model ID, falling back to default."""
    valid_ids = {m["id"] for m in AVAILABLE_MODELS}
    if model_id and model_id in valid_ids:
        return model_id
    return DEFAULT_MODEL_ID


def _build_contents(
    user_message: str,
    attachments: list[Attachment] | None,
    context_chunks: list[str] | None,
) -> list:
    """Build content parts for the Gemini request."""
    parts: list = []

    if context_chunks:
        rag_context = "\n\n---\n\n".join(context_chunks)
        parts.append(
            genai_types.Part.from_text(
                text=f"[Relevant document context from knowledge base]\n\n{rag_context}\n\n---\n\n"
            )
        )

    parts.append(genai_types.Part.from_text(text=user_message))

    if attachments:
        for att in attachments:
            if att.type.startswith("image/"):
                try:
                    raw = base64.b64decode(att.content)
                    parts.append(
                        genai_types.Part.from_bytes(data=raw, mime_type=att.type)
                    )
                except Exception:
                    parts.append(
                        genai_types.Part.from_text(
                            text=f"\n[Image attachment: {att.name} — could not decode]"
                        )
                    )
            else:
                parts.append(
                    genai_types.Part.from_text(
                        text=f"\n[Attached file: {att.name}]\n{att.content}"
                    )
                )

    return [genai_types.Content(role="user", parts=parts)]


def _gen_config() -> genai_types.GenerateContentConfig:
    return genai_types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.3,
        max_output_tokens=2048,
    )


async def chat_complete(
    user_message: str,
    attachments: list[Attachment] | None = None,
    context_chunks: list[str] | None = None,
    model_id: str | None = None,
) -> str:
    """Non-streaming Gemini chat completion."""
    client = _get_client()
    model_name = _resolve_model(model_id)
    contents = _build_contents(user_message, attachments, context_chunks)
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=contents,
        config=_gen_config(),
    )
    return response.text or ""


async def chat_stream(
    user_message: str,
    attachments: list[Attachment] | None = None,
    context_chunks: list[str] | None = None,
    model_id: str | None = None,
) -> AsyncIterator[str]:
    """Streaming Gemini chat — yields text chunks."""
    client = _get_client()
    model_name = _resolve_model(model_id)
    contents = _build_contents(user_message, attachments, context_chunks)
    async for chunk in await client.aio.models.generate_content_stream(
        model=model_name,
        contents=contents,
        config=_gen_config(),
    ):
        if chunk.text:
            yield chunk.text

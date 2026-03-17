"""InsurGuard AI — FastAPI application entry point."""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import HealthResponse
from app.routers import chat, dashboard, upload

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="InsurGuard AI API",
        description="AI-powered insurance coverage analysis backend",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(chat.router)
    app.include_router(dashboard.router)
    app.include_router(upload.router)

    @app.get("/health", response_model=HealthResponse, tags=["health"])
    async def health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            version="0.1.0",
            model=settings.gemini_model,
        )

    @app.on_event("startup")
    async def startup() -> None:
        os.makedirs(settings.upload_dir, exist_ok=True)
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)
        logger.info("InsurGuard backend started (env=%s, model=%s)", settings.app_env, settings.gemini_model)

    return app


app = create_app()

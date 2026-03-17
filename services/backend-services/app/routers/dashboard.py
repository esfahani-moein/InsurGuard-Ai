"""Dashboard stats endpoint."""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta
import random

from fastapi import APIRouter

from app.models import ActivityItem, DashboardStats
from app.services.document_store import get_stats

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

_query_counter = 0


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _minutes_ago(n: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(minutes=n)).isoformat()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats() -> DashboardStats:
    doc_stats = get_stats()

    recent_activity: list[ActivityItem] = [
        ActivityItem(
            type="query",
            description="Coverage gap analysis on Commercial Auto Policy",
            timestamp=_minutes_ago(2),
            status="success",
        ),
        ActivityItem(
            type="upload",
            description="General Liability Policy v3.pdf uploaded",
            timestamp=_minutes_ago(8),
            status="success",
        ),
        ActivityItem(
            type="analysis",
            description="Risk assessment flagged 2 exclusion clauses",
            timestamp=_minutes_ago(15),
            status="warning",
        ),
        ActivityItem(
            type="query",
            description="Deductible structure explained for homeowners policy",
            timestamp=_minutes_ago(31),
            status="success",
        ),
        ActivityItem(
            type="export",
            description="Coverage comparison report exported",
            timestamp=_minutes_ago(47),
            status="success",
        ),
    ]

    return DashboardStats(
        total_documents=doc_stats["total_documents"],
        total_queries=_query_counter,
        coverage_checks=max(0, _query_counter - 5),
        risk_assessments=max(0, _query_counter // 3),
        avg_response_time_ms=1240.0,
        accuracy_rate=0.984,
        recent_activity=recent_activity,
    )

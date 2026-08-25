from fastapi import APIRouter

from app.api.v1.endpoints.auth import (
    router as auth_router,
)
from app.api.v1.endpoints.health import (
    router as health_router,
)
from app.api.v1.endpoints.document import (
    router as document_router,
)
from app.api.v1.endpoints.document.management import (
    router as document_management_router,
)
from app.api.v1.endpoints.rag.ask import (
    router as rag_router,
)
from app.api.v1.endpoints.chat.chat import (
    router as chat_router,
)
from app.api.v1.endpoints.chat.message import (
    router as message_router,
)
from app.api.v1.endpoints.chat.history import (
    router as history_router,
)
from app.api.v1.endpoints.dashboard.dashboard import (
    router as dashboard_router,
)
from app.api.v1.endpoints.assistant.assistant import (
    router as assistant_router,
)


api_router = APIRouter()


# ============================================================
# DOCUMENTS
# ============================================================

api_router.include_router(
    document_router,
)

api_router.include_router(
    document_management_router,
)


# ============================================================
# AI ASSISTANT
# ============================================================

api_router.include_router(
    assistant_router,
    prefix="/assistant",
    tags=["AI Assistant"],
)


# ============================================================
# CHAT
# ============================================================

api_router.include_router(
    chat_router,
    prefix="/chat",
    tags=["Chat"],
)

api_router.include_router(
    message_router,
    prefix="/chat",
    tags=["Chat"],
)

api_router.include_router(
    history_router,
    prefix="/chat",
    tags=["Chat"],
)


# ============================================================
# RAG / KNOWLEDGE
# ============================================================

api_router.include_router(
    rag_router,
    prefix="/rag",
    tags=["RAG"],
)


# ============================================================
# DASHBOARD
# ============================================================

api_router.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================================
# HEALTH
# ============================================================

api_router.include_router(
    health_router,
    prefix="/health",
    tags=["Health"],
)


# ============================================================
# AUTHENTICATION
# ============================================================

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)
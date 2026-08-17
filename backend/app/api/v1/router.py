from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.document import router as document_router
from app.api.v1.endpoints.document.management import (
    router as document_management_router,
)
from app.api.v1.endpoints.rag.ask import router as rag_router
from app.api.v1.endpoints.chat.chat import router as chat_router
from app.api.v1.endpoints.chat.message import router as message_router
from app.api.v1.endpoints.chat.history import router as history_router


api_router = APIRouter()


# Documents - Upload
api_router.include_router(
    document_router,
)


# Documents - Management
api_router.include_router(
    document_management_router,
)


# Chat - Conversations
api_router.include_router(
    chat_router,
    prefix="/chat",
    tags=["Chat"],
)


# Chat - Messages
api_router.include_router(
    message_router,
    prefix="/chat",
    tags=["Chat"],
)


# Chat - History
api_router.include_router(
    history_router,
    prefix="/chat",
    tags=["Chat"],
)


# RAG
api_router.include_router(
    rag_router,
    prefix="/rag",
    tags=["RAG"],
)


# Health
api_router.include_router(
    health_router,
    prefix="/health",
    tags=["Health"],
)


# Authentication
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)
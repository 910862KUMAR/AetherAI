# API Version 1

from app.api.v1.routes.admin import router as admin_router
from app.api.v1.routes.agents import router as agents_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.chat import router as chat_router
from app.api.v1.routes.documents import router as documents_router
from app.api.v1.routes.evaluation import router as evaluation_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.mcp import router as mcp_router
from app.api.v1.routes.memory import router as memory_router
from app.api.v1.routes.rag import router as rag_router
from app.api.v1.routes.users import router as users_router

__all__ = [
    "auth_router",
    "users_router",
    "chat_router",
    "documents_router",
    "rag_router",
    "agents_router",
    "memory_router",
    "mcp_router",
    "health_router",
    "admin_router",
    "evaluation_router",
]
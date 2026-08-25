from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config.settings import settings
from app.middleware.logging.logging_middleware import (
    logging_middleware,
)
from app.middleware.rate_limit.rate_limiter import (
    rate_limit_middleware,
)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    debug=settings.DEBUG,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)


# ============================================================
# MIDDLEWARE
# ============================================================

app.middleware("http")(rate_limit_middleware)
app.middleware("http")(logging_middleware)


# ============================================================
# ROOT & HEALTH
# ============================================================

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": (
            "Welcome to AetherAI - "
            "Enterprise AI Knowledge & Operations Copilot"
        ),
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "application": settings.APP_NAME,
    }


# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    AetherAI application lifespan.
    """

    # Startup

    settings.UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    settings.STORAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    settings.ARTIFACT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    settings.LOG_DIRECTORY.mkdir(parents=True, exist_ok=True)

    print("🚀 AetherAI Backend Started Successfully")

    yield

    # Shutdown

    print("🛑 AetherAI Backend Shutdown Successfully")
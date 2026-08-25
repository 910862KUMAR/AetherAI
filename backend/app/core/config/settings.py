from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[4]
BACKEND_DIR = BASE_DIR / "backend"


class Settings(BaseSettings):
    """
    AetherAI Production Settings
    """

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # =====================================================
    # APPLICATION
    # =====================================================

    APP_NAME: str = "AetherAI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = (
        "Enterprise AI Knowledge & Operations Copilot"
    )

    API_V1_PREFIX: str = "/api/v1"

    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # =====================================================
    # SERVER
    # =====================================================

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # =====================================================
    # SECURITY
    # =====================================================

    SECRET_KEY: str = Field(
        ...,
        description="Application Secret Key",
    )

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # =====================================================
    # DATABASE
    # =====================================================

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str

    # =====================================================
    # REDIS
    # =====================================================

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""

    # =====================================================
    # GROQ
    # =====================================================

    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # =====================================================
    # EMBEDDINGS
    # =====================================================

    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # =====================================================
    # VECTOR DATABASE
    # =====================================================

    VECTOR_COLLECTION: str = "aetherai_documents"

    # =====================================================
    # FILE STORAGE
    # =====================================================

    UPLOAD_DIRECTORY: Path = BACKEND_DIR / "uploads"
    STORAGE_DIRECTORY: Path = BACKEND_DIR / "storage"
    ARTIFACT_DIRECTORY: Path = BACKEND_DIR / "artifacts"
    LOG_DIRECTORY: Path = BACKEND_DIR / "logs"

    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024

    ALLOWED_FILE_TYPES: List[str] = [
        ".pdf",
        ".docx",
        ".txt",
        ".md",
        ".csv",
        ".xlsx",
    ]

    # =====================================================
    # CORS
    # =====================================================

   ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://aether-ai-sage.vercel.app",
]

    ALLOWED_METHODS: List[str] = ["*"]
    ALLOWED_HEADERS: List[str] = ["*"]
    ALLOW_CREDENTIALS: bool = True

    # =====================================================
    # LOGGING
    # =====================================================

    LOG_LEVEL: str = "INFO"

    LOG_FORMAT: str = (
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    # =====================================================
    # DATABASE URLS
    # =====================================================

    @property
    def async_database_url(self) -> str:
        return (
            f"postgresql+asyncpg://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}"
            f"/{self.POSTGRES_DB}"
        )

    @property
    def sync_database_url(self) -> str:
        return (
            f"postgresql+psycopg://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}"
            f"/{self.POSTGRES_DB}"
        )

    @property
    def redis_url(self) -> str:
        if self.REDIS_PASSWORD:
            return (
                f"redis://:{self.REDIS_PASSWORD}"
                f"@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
            )

        return (
            f"redis://{self.REDIS_HOST}:"
            f"{self.REDIS_PORT}/{self.REDIS_DB}"
        )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    settings.UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    settings.STORAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    settings.ARTIFACT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    settings.LOG_DIRECTORY.mkdir(parents=True, exist_ok=True)

    return settings


settings = get_settings()
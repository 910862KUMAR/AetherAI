from fastapi.middleware.cors import CORSMiddleware

from app.core.config.settings import settings


def configure_cors(app) -> None:
    """
    Configure CORS middleware.
    """

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=settings.ALLOW_CREDENTIALS,
        allow_methods=settings.ALLOWED_METHODS,
        allow_headers=settings.ALLOWED_HEADERS,
    )
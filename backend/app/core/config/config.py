from functools import lru_cache

from app.core.config.settings import Settings


@lru_cache
def get_config() -> Settings:
    """
    Returns a cached application configuration instance.
    """

    return Settings()


config = get_config()
import redis.asyncio as redis

from app.core.config.settings import settings


class RedisClient:

    _client = redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )

    @classmethod
    async def get_client(cls):
        return cls._client

    @classmethod
    async def ping(cls) -> bool:
        try:
            return await cls._client.ping()
        except Exception:
            return False

    @classmethod
    async def close(cls):
        await cls._client.aclose()
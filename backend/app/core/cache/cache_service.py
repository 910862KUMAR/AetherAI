import json
from typing import Any

from app.core.cache.redis_client import RedisClient


class CacheService:

    @staticmethod
    async def set(
        key: str,
        value: Any,
        expire: int = 300,
    ) -> bool:

        client = await RedisClient.get_client()

        if isinstance(value, (dict, list)):
            value = json.dumps(value, default=str)

        await client.set(
            key,
            value,
            ex=expire,
        )

        return True

    @staticmethod
    async def get(
        key: str,
    ) -> Any:

        client = await RedisClient.get_client()

        value = await client.get(key)

        if value is None:
            return None

        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value

    @staticmethod
    async def delete(
        key: str,
    ) -> bool:

        client = await RedisClient.get_client()

        await client.delete(key)

        return True

    @staticmethod
    async def exists(
        key: str,
    ) -> bool:

        client = await RedisClient.get_client()

        return bool(
            await client.exists(key)
        )
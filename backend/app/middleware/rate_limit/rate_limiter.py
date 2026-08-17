from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.cache.redis_client import RedisClient


class RateLimiter:

    WINDOW_SECONDS = 60
    MAX_REQUESTS = 60

    @classmethod
    async def check(
        cls,
        request: Request,
    ) -> bool:

        try:
            client = await RedisClient.get_client()

            forwarded_for = request.headers.get(
                "X-Forwarded-For"
            )

            client_ip = (
                forwarded_for.split(",")[0].strip()
                if forwarded_for
                else (
                    request.client.host
                    if request.client
                    else "unknown"
                )
            )

            key = f"rate_limit:{client_ip}"

            current_count = await client.incr(key)

            if current_count == 1:
                await client.expire(
                    key,
                    cls.WINDOW_SECONDS,
                )

            return current_count <= cls.MAX_REQUESTS

        except Exception:
            # If Redis is unavailable, do not block
            # the entire application.
            return True


async def rate_limit_middleware(
    request: Request,
    call_next,
):

    allowed = await RateLimiter.check(request)

    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                "detail": (
                    "Too many requests. "
                    "Please try again later."
                )
            },
            headers={
                "Retry-After": str(
                    RateLimiter.WINDOW_SECONDS
                )
            },
        )

    return await call_next(request)
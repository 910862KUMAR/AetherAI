from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions.exceptions import AetherAIException


async def aetherai_exception_handler(
    request: Request,
    exc: AetherAIException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
        },
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
        },
    )
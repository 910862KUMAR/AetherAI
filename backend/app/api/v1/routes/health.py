from fastapi import APIRouter
from datetime import datetime

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "application": "AetherAI",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }
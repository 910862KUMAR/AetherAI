from fastapi import APIRouter

from app.api.v1.endpoints.document.upload import router as upload_router

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

router.include_router(upload_router)
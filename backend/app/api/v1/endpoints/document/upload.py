from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.session.session import get_db
from app.services.document.document_background_service import (
    DocumentBackgroundService,
)
from app.services.document.document_service import DocumentService


router = APIRouter()


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):

    result = await DocumentService.save_document(
        db=db,
        file=file,
        user_id=current_user["sub"],
    )

    background_tasks.add_task(
        DocumentBackgroundService.process_document,
        document_id=result["document_id"],
        file_path=result["file_path"],
        user_id=current_user["sub"],
    )

    return result
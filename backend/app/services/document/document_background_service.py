from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session.session import AsyncSessionLocal
from app.services.document.document_processing_service import (
    DocumentProcessingService,
)


class DocumentBackgroundService:

    @staticmethod
    async def process_document(
        document_id: str,
        file_path: str,
        user_id: str,
    ) -> None:

        async with AsyncSessionLocal() as db:

            await DocumentProcessingService.process_document(
                db=db,
                document_id=document_id,
                file_path=file_path,
                user_id=user_id,
            )
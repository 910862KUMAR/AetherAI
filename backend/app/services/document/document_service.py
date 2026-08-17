from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document


class DocumentService:

    UPLOAD_DIR = Path("uploads")

    @classmethod
    async def save_document(
        cls,
        db: AsyncSession,
        file: UploadFile,
        user_id: str,
    ):

        cls.UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        document_id = uuid4()

        filename = f"{document_id}_{file.filename}"
        file_path = cls.UPLOAD_DIR / filename

        content = await file.read()

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        db_document = Document(
            id=document_id,
            filename=filename,
            original_filename=file.filename,
            file_path=str(file_path),
            content_type=(
                file.content_type
                or "application/octet-stream"
            ),
            file_size=file_path.stat().st_size,
            is_processed=False,
            uploaded_by=UUID(user_id),
        )

        db.add(db_document)
        await db.commit()
        await db.refresh(db_document)

        return {
            "document_id": str(db_document.id),
            "filename": db_document.filename,
            "original_filename": db_document.original_filename,
            "content_type": db_document.content_type,
            "file_size": db_document.file_size,
            "file_path": db_document.file_path,
            "is_processed": False,
            "message": (
                "Document uploaded successfully. "
                "Processing started in background."
            ),
        }
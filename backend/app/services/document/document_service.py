from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document
from app.services.storage.supabase_storage_service import (
    SupabaseStorageService,
)


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

        original_filename = file.filename or "document"

        safe_filename = Path(
            original_filename
        ).name

        filename = (
            f"{document_id}_{safe_filename}"
        )

        local_path = cls.UPLOAD_DIR / filename

        content = await file.read()

        with open(local_path, "wb") as buffer:
            buffer.write(content)

        storage_path = (
            f"{user_id}/{document_id}/{safe_filename}"
        )

        try:

            await SupabaseStorageService.upload_file(
                file_path=str(local_path),
                storage_path=storage_path,
                content_type=(
                    file.content_type
                    or "application/octet-stream"
                ),
            )

            db_document = Document(
                id=document_id,
                filename=filename,
                original_filename=safe_filename,
                file_path=storage_path,
                content_type=(
                    file.content_type
                    or "application/octet-stream"
                ),
                file_size=len(content),
                is_processed=False,
                uploaded_by=UUID(user_id),
            )

            db.add(db_document)

            await db.commit()
            await db.refresh(db_document)

            return {
                "document_id": str(db_document.id),
                "filename": db_document.filename,
                "original_filename": (
                    db_document.original_filename
                ),
                "content_type": db_document.content_type,
                "file_size": db_document.file_size,
                "file_path": db_document.file_path,
                "is_processed": False,
                "message": (
                    "Document uploaded successfully. "
                    "Processing started in background."
                ),
            }

        except Exception:

            await db.rollback()

            try:
                await SupabaseStorageService.delete_file(
                    storage_path=storage_path,
                )
            except Exception:
                pass

            raise

        finally:

            if local_path.exists():
                local_path.unlink()

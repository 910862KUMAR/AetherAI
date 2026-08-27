from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.models.document import Document
from app.db.session.session import get_db
from app.services.document.vector_store_service import VectorStoreService
from app.services.storage.supabase_storage_service import (
    SupabaseStorageService,
)


router = APIRouter()


@router.get("/documents")
async def get_documents(
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["sub"])

    result = await db.execute(
        select(Document)
        .where(Document.uploaded_by == user_id)
        .order_by(Document.created_at.desc())
    )

    documents = result.scalars().all()

    return [
        {
            "id": str(document.id),
            "filename": document.filename,
            "original_filename": document.original_filename,
            "content_type": document.content_type,
            "file_size": document.file_size,
            "is_processed": document.is_processed,
            "created_at": document.created_at,
        }
        for document in documents
    ]


@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        document_uuid = UUID(document_id)
        user_id = UUID(current_user["sub"])
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID.",
        )

    result = await db.execute(
        select(Document).where(
            Document.id == document_uuid,
            Document.uploaded_by == user_id,
        )
    )

    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return {
        "id": str(document.id),
        "filename": document.filename,
        "original_filename": document.original_filename,
        "file_path": document.file_path,
        "content_type": document.content_type,
        "file_size": document.file_size,
        "is_processed": document.is_processed,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
    }


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        document_uuid = UUID(document_id)
        user_id = UUID(current_user["sub"])
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID.",
        )

    result = await db.execute(
        select(Document).where(
            Document.id == document_uuid,
            Document.uploaded_by == user_id,
        )
    )

    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    document_id_str = str(document.id)
    storage_path = document.file_path

    VectorStoreService.delete_document(
        document_id=document_id_str,
    )

    try:
        await SupabaseStorageService.delete_file(
            storage_path=storage_path,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Document could not be removed from "
                f"storage: {exc}"
            ),
        )

    await db.delete(document)
    await db.commit()

    return {
        "message": "Document deleted successfully.",
        "document_id": document_id_str,
    }

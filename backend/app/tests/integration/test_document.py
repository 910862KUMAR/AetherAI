from io import BytesIO
from uuid import uuid4

import pytest
from fastapi import UploadFile
from sqlalchemy import select

from app.db.models.document import Document
from app.db.models.role import Role
from app.db.models.user import User
from app.db.session.database import AsyncSessionLocal
from app.services.document.document_service import DocumentService


@pytest.mark.asyncio
async def test_save_document():

    role_id = uuid4()
    user_id = uuid4()

    async with AsyncSessionLocal() as db:

        # Create test role
        role = Role(
            id=role_id,
            role_name=f"test_role_{uuid4().hex[:8]}",
            description="Test role",
            permissions="test",
        )

        db.add(role)
        await db.flush()

        # Create test user
        user = User(
            id=user_id,
            full_name="AetherAI Test User",
            email=f"test_{uuid4().hex[:8]}@example.com",
            password_hash="test-password-hash",
            role_id=role_id,
            is_active=True,
            is_verified=True,
        )

        db.add(user)
        await db.commit()

        file = UploadFile(
            filename="test_document.txt",
            file=BytesIO(
                b"AetherAI document testing content."
            ),
        )

        result = await DocumentService.save_document(
            db=db,
            file=file,
            user_id=str(user_id),
        )

        assert result["original_filename"] == "test_document.txt"
        assert result["is_processed"] is False
        assert result["file_size"] == 34
        assert result["message"].startswith(
            "Document uploaded successfully"
        )

        document_id = result["document_id"]

        query = await db.execute(
            select(Document).where(
                Document.id == document_id
            )
        )

        document = query.scalar_one_or_none()

        assert document is not None
        assert document.uploaded_by == user_id
        assert document.original_filename == "test_document.txt"

        # Cleanup test data
        await db.delete(document)
        await db.delete(user)
        await db.delete(role)
        await db.commit()
from pathlib import Path
from uuid import UUID

import pymupdf
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document
from app.services.document.chunking_service import ChunkingService
from app.services.document.embedding_service import EmbeddingService
from app.services.document.vector_store_service import VectorStoreService


class DocumentProcessingService:

    @staticmethod
    async def process_document(
        db: AsyncSession,
        document_id: str,
        file_path: str,
        user_id: str,
    ) -> None:

        document = await db.get(
            Document,
            UUID(document_id),
        )

        if document is None:
            return

        try:

            pdf = pymupdf.open(file_path)

            text = ""

            for page in pdf:
                text += page.get_text()

            pdf.close()

            chunks = ChunkingService.chunk_text(text)

            if chunks:

                embeddings = (
                    EmbeddingService.generate_embeddings(
                        chunks
                    )
                )

                VectorStoreService.add_documents(
                    chunks=chunks,
                    embeddings=embeddings,
                    document_id=document_id,
                    user_id=user_id,
                )

            document.is_processed = True

            await db.commit()

        except Exception:

            document.is_processed = False

            await db.commit()

            raise
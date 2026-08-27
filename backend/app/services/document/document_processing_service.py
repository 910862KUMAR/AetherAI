from pathlib import Path
from uuid import UUID

import pymupdf
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document
from app.db.models.document_chunk import DocumentChunk
from app.services.document.chunking_service import ChunkingService
from app.services.document.embedding_service import EmbeddingService


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
                embeddings = EmbeddingService.generate_embeddings(
                    chunks
                )

                await db.execute(
                    DocumentChunk.__table__.delete().where(
                        DocumentChunk.document_id == UUID(document_id)
                    )
                )

                for index, (chunk, embedding) in enumerate(
                    zip(chunks, embeddings)
                ):
                    db.add(
                        DocumentChunk(
                            document_id=UUID(document_id),
                            user_id=UUID(user_id),
                            chunk_index=index,
                            content=chunk,
                            embedding=embedding,
                        )
                    )

            document.is_processed = True

            await db.commit()

        except Exception:
            document.is_processed = False
            await db.commit()
            raise

        finally:
            local_file = Path(file_path)

            if local_file.exists():
                local_file.unlink()

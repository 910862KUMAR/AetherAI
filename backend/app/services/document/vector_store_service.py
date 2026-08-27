from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document_chunk import DocumentChunk


class VectorStoreService:

    @staticmethod
    async def add_documents(
        db: AsyncSession,
        chunks: list[str],
        embeddings: list[list[float]],
        document_id: str,
        user_id: str,
    ) -> None:

        if not chunks:
            return

        from uuid import UUID

        document_uuid = UUID(document_id)
        user_uuid = UUID(user_id)

        await db.execute(
            DocumentChunk.__table__.delete().where(
                DocumentChunk.document_id == document_uuid
            )
        )

        for index, (chunk, embedding) in enumerate(
            zip(chunks, embeddings)
        ):
            db.add(
                DocumentChunk(
                    document_id=document_uuid,
                    user_id=user_uuid,
                    chunk_index=index,
                    content=chunk,
                    embedding=embedding,
                )
            )

        await db.flush()

    @staticmethod
    async def search(
        db: AsyncSession,
        query_embedding: list[float],
        user_id: str,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:

        if not query_embedding:
            return []

        from uuid import UUID

        user_uuid = UUID(user_id)

        distance = DocumentChunk.embedding.cosine_distance(
            query_embedding
        )

        result = await db.execute(
            select(
                DocumentChunk,
                distance.label("distance"),
            )
            .where(
                DocumentChunk.user_id == user_uuid,
            )
            .order_by(distance)
            .limit(top_k)
        )

        rows = result.all()

        return [
            {
                "document": chunk.content,
                "metadata": {
                    "document_id": str(chunk.document_id),
                    "user_id": str(chunk.user_id),
                    "chunk_index": chunk.chunk_index,
                },
                "distance": float(distance_value),
            }
            for chunk, distance_value in rows
        ]

    @staticmethod
    async def delete_document(
        db: AsyncSession,
        document_id: str,
    ) -> None:

        from uuid import UUID

        await db.execute(
            DocumentChunk.__table__.delete().where(
                DocumentChunk.document_id == UUID(document_id)
            )
        )

        await db.flush()

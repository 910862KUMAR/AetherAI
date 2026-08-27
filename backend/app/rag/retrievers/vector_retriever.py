from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.document.vector_store_service import VectorStoreService


class VectorRetriever:

    @staticmethod
    async def search(
        db: AsyncSession,
        query_embedding: list[float],
        user_id: str,
        top_k: int = 10,
    ) -> list[dict[str, Any]]:

        if not query_embedding:
            return []

        return await VectorStoreService.search(
            db=db,
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=top_k,
        )

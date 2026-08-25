from typing import Any

from app.services.document.vector_store_service import (
    VectorStoreService,
)


class PGVectorStore:

    """
    Compatibility abstraction for the RAG layer.

    AetherAI currently uses ChromaDB through
    VectorStoreService. This class keeps the RAG
    vector-store interface isolated so the storage
    backend can be replaced later without changing
    the RAG pipeline.
    """

    @staticmethod
    def search(
        query_embedding: list[float],
        user_id: str,
        top_k: int = 10,
    ) -> dict[str, Any]:

        return VectorStoreService.search(
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=top_k,
        )

    @staticmethod
    def delete_document(
        document_id: str,
    ) -> None:

        VectorStoreService.delete_document(
            document_id
        )

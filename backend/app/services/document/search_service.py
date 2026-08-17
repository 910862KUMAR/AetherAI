from app.services.document.embedding_service import EmbeddingService
from app.services.document.vector_store_service import VectorStoreService


class SearchService:

    @classmethod
    def search(
        cls,
        query: str,
        user_id: str,
        top_k: int = 5,
    ):

        query_embedding = EmbeddingService.generate_embeddings(
            [query]
        )[0]

        results = VectorStoreService.search(
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=top_k,
        )

        return results
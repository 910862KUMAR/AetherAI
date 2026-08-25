from app.services.document.embedding_service import EmbeddingService


class RAGEmbeddingService:

    @staticmethod
    def embed_query(query: str) -> list[float]:

        query = query.strip()

        if not query:
            return []

        embeddings = EmbeddingService.generate_embeddings(
            [query]
        )

        return embeddings[0] if embeddings else []

    @staticmethod
    def embed_documents(
        documents: list[str],
    ) -> list[list[float]]:

        return EmbeddingService.generate_embeddings(
            documents
        )

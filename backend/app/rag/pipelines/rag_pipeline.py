from sqlalchemy.ext.asyncio import AsyncSession

from app.rag.embeddings.embedding_service import RAGEmbeddingService
from app.rag.retrievers.vector_retriever import VectorRetriever
from app.rag.rerankers.reranker import Reranker


class RAGPipeline:

    @staticmethod
    async def retrieve(
        db: AsyncSession,
        query: str,
        user_id: str,
        top_k: int = 5,
    ) -> list[dict]:

        query = query.strip()

        if not query:
            return []

        query_embedding = RAGEmbeddingService.embed_query(query)

        if not query_embedding:
            return []

        candidates = await VectorRetriever.search(
            db=db,
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=max(top_k * 3, 10),
        )

        if not candidates:
            return []

        return Reranker.rerank(
            query=query,
            candidates=candidates,
            top_k=top_k,
        )

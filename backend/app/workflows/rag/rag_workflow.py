from typing import Any

from app.rag.pipelines.rag_pipeline import RAGPipeline


class RAGWorkflow:

    @staticmethod
    async def retrieve(
        query: str,
        user_id: str,
        top_k: int = 5,
    ) -> dict[str, Any]:

        query = query.strip()

        if not query:
            return {
                "query": "",
                "documents": [],
                "sources": [],
            }

        results = await RAGPipeline.retrieve(
            query=query,
            user_id=user_id,
            top_k=top_k,
        )

        documents = [
            result.get("document", "")
            for result in results
            if result.get("document")
        ]

        sources = []

        for result in results:
            metadata = result.get(
                "metadata",
                {},
            )

            sources.append(
                {
                    "document_id": metadata.get(
                        "document_id"
                    ),
                    "chunk_index": metadata.get(
                        "chunk_index"
                    ),
                    "distance": result.get(
                        "distance"
                    ),
                    "rerank_score": result.get(
                        "rerank_score"
                    ),
                }
            )

        return {
            "query": query,
            "documents": documents,
            "sources": sources,
        }

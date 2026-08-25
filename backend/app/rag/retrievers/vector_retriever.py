from typing import Any

from app.services.document.vector_store_service import VectorStoreService


class VectorRetriever:

    @staticmethod
    def search(
        query_embedding: list[float],
        user_id: str,
        top_k: int = 10,
    ) -> list[dict[str, Any]]:

        if not query_embedding:
            return []

        results = VectorStoreService.search(
            query_embedding=query_embedding,
            user_id=user_id,
            top_k=top_k,
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        candidates = []

        for index, document in enumerate(documents):

            if not document or not document.strip():
                continue

            metadata = (
                metadatas[index]
                if index < len(metadatas)
                else {}
            )

            distance = (
                distances[index]
                if index < len(distances)
                else None
            )

            candidates.append(
                {
                    "document": document,
                    "metadata": metadata or {},
                    "distance": (
                        float(distance)
                        if distance is not None
                        else None
                    ),
                }
            )

        return candidates

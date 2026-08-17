from app.llm.clients.groq_client import GroqClient
from app.services.document.search_service import SearchService


class RAGService:

    MAX_DISTANCE = 0.75

    @classmethod
    async def answer(
        cls,
        query: str,
        user_id: str,
        conversation_history: list[dict] | None = None,
        top_k: int = 5,
    ) -> dict:

        results = SearchService.search(
            query=query,
            user_id=user_id,
            top_k=top_k,
        )

        documents = results.get(
            "documents",
            [[]],
        )[0]

        metadatas = results.get(
            "metadatas",
            [[]],
        )[0]

        distances = results.get(
            "distances",
            [[]],
        )[0]

        relevant_documents = []
        relevant_metadatas = []
        relevant_distances = []

        for index, document in enumerate(documents):

            distance = (
                distances[index]
                if index < len(distances)
                else None
            )

            if distance is None:
                continue

            if distance <= cls.MAX_DISTANCE:

                relevant_documents.append(document)

                metadata = (
                    metadatas[index]
                    if index < len(metadatas)
                    else {}
                )

                relevant_metadatas.append(metadata)
                relevant_distances.append(distance)

        if not relevant_documents:
            return {
                "answer": (
                    "I could not find relevant information "
                    "in the uploaded documents."
                ),
                "sources": [],
            }

        context_parts = []

        for index, document in enumerate(
            relevant_documents
        ):

            metadata = relevant_metadatas[index]

            context_parts.append(
                f"""
Source {index + 1}
Document ID: {metadata.get("document_id", "unknown")}
Chunk: {metadata.get("chunk_index", "unknown")}

Content:
{document}
"""
            )

        context = "\n\n---\n\n".join(
            context_parts
        )

        history_text = ""

        if conversation_history:

            history_parts = []

            for item in conversation_history:

                sender = item.get(
                    "sender_type",
                    "unknown",
                )

                message = item.get(
                    "message",
                    "",
                )

                history_parts.append(
                    f"{sender}: {message}"
                )

            history_text = "\n".join(
                history_parts
            )

        system_prompt = """
You are AetherAI, an enterprise AI knowledge and
operations copilot.

Your responsibilities:

1. Answer using the supplied document context.
2. Use conversation history only to understand context.
3. Do not invent facts.
4. Do not use information outside the supplied documents.
5. If the answer is not available in the documents,
   clearly state that it could not be found.
6. Keep answers clear, professional, and useful.
"""

        user_prompt = f"""
Conversation History:
{history_text if history_text else "No previous conversation."}

Retrieved Document Context:
{context}

Current User Question:
{query}

Answer the current question using the retrieved
document context.
"""

        answer = await GroqClient().generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        sources = []

        for index, metadata in enumerate(
            relevant_metadatas
        ):

            sources.append(
                {
                    "document_id": metadata.get(
                        "document_id"
                    ),
                    "chunk_index": metadata.get(
                        "chunk_index"
                    ),
                    "distance": relevant_distances[index],
                }
            )

        return {
            "answer": answer,
            "sources": sources,
        }
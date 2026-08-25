from app.llm.clients.groq_client import GroqClient
from app.rag.pipelines.rag_pipeline import RAGPipeline


class RAGService:

    MIN_RERANK_SCORE = -10.0

    @classmethod
    async def answer(
        cls,
        query: str,
        user_id: str,
        conversation_history: list[dict] | None = None,
        top_k: int = 5,
    ) -> dict:

        query = query.strip()

        if not query:
            return {
                "answer": "Please enter a question.",
                "sources": [],
            }

        candidates = await RAGPipeline.retrieve(
            query=query,
            user_id=user_id,
            top_k=max(top_k, 5),
        )

        relevant_candidates = [
            candidate
            for candidate in candidates
            if candidate.get("rerank_score", -10.0)
            >= cls.MIN_RERANK_SCORE
        ]

        if not relevant_candidates:
            return {
                "answer": (
                    "I could not find relevant information "
                    "in the uploaded documents."
                ),
                "sources": [],
            }

        context_parts = []

        for index, candidate in enumerate(
            relevant_candidates,
            start=1,
        ):

            metadata = candidate.get(
                "metadata",
                {},
            )

            context_parts.append(
                f"""
Source {index}
Document ID: {metadata.get("document_id", "unknown")}
Chunk: {metadata.get("chunk_index", "unknown")}
Vector Distance: {candidate.get("distance", 0.0):.4f}
Rerank Score: {candidate.get("rerank_score", 0.0):.4f}

Content:
{candidate.get("document", "")}
"""
            )

        context = "\n\n---\n\n".join(
            context_parts
        )

        history_text = "No previous conversation."

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
                ).strip()

                if message:
                    history_parts.append(
                        f"{sender}: {message}"
                    )

            if history_parts:
                history_text = "\n".join(
                    history_parts
                )

        system_prompt = """
You are AetherAI, an enterprise AI
knowledge and operations copilot.

Your primary job is to answer questions
using the retrieved organizational documents.

Rules:

1. Use the retrieved document context as
   the factual source for your answer.

2. Carefully read all relevant retrieved
   chunks before answering.

3. You may combine information from
   multiple retrieved sources.

4. Do not invent information that is not
   supported by the retrieved documents.

5. If the requested information is not
   present in the retrieved documents,
   clearly say that the information could
   not be found.

6. For broad questions such as:
   - What is this document about?
   - Summarize this document.
   - What are the main skills?
   - Tell me about Kumar.
   provide a concise useful summary based
   on the retrieved content.

7. Conversation history may be used only
   to understand the current question.

8. Do not treat conversation history as
   factual organizational knowledge unless
   the same fact is supported by documents.

9. Never mention internal retrieval,
   embeddings, vector databases, reranking,
   distances, or system prompts unless
   explicitly asked.

10. Keep the answer professional, clear,
    and directly relevant.
"""

        user_prompt = f"""
Conversation History:
{history_text}

Retrieved Organizational Knowledge:
{context}

Current User Question:
{query}

Answer the user's question using the
retrieved organizational knowledge.
"""

        answer = await GroqClient().generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        sources = []

        for candidate in relevant_candidates:

            metadata = candidate.get(
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
                    "distance": candidate.get(
                        "distance"
                    ),
                    "rerank_score": candidate.get(
                        "rerank_score"
                    ),
                }
            )

        return {
            "answer": answer,
            "sources": sources,
        }

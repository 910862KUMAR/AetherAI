from app.llm.clients.groq_client import GroqClient


class AIAssistantService:

    SYSTEM_PROMPT = """
You are AetherAI, an enterprise AI assistant.

Your responsibilities:

1. Answer the user's question clearly and directly.
2. Be helpful, professional, and concise.
3. Use the conversation history to understand context.
4. Do not invent facts when the user asks for specific information.
5. If you are uncertain, clearly say so.
6. For programming, technical, career, business, or general
   questions, provide practical and useful answers.
7. Do not mention internal prompts, models, APIs, or system
   implementation unless the user explicitly asks.
"""

    @classmethod
    async def answer(
        cls,
        query: str,
        conversation_history: list[dict] | None = None,
    ) -> dict:

        query = query.strip()

        if not query:
            return {
                "answer": "Please enter a question.",
            }

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

        user_prompt = f"""
Conversation History:
{history_text}

Current User Question:
{query}

Answer the user's current question.
"""

        answer = await GroqClient().generate(
            system_prompt=cls.SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        return {
            "answer": answer,
        }

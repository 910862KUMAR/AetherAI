from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.message import Message
from app.services.ai_assistant_service import AIAssistantService
from app.services.conversation_service import ConversationService


class ChatService:

    @staticmethod
    async def chat(
        db: AsyncSession,
        user_id: str,
        conversation_id: str,
        query: str,
        top_k: int = 5,
    ) -> dict:

        query = query.strip()

        if not query:
            raise ValueError(
                "Message cannot be empty."
            )

        conversation = (
            await ConversationService.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        if conversation is None:
            raise ValueError(
                "Conversation not found."
            )

        history_result = await db.execute(
            select(Message)
            .where(
                Message.conversation_id == conversation.id
            )
            .order_by(
                Message.created_at.asc()
            )
        )

        previous_messages = (
            history_result.scalars().all()
        )

        conversation_history = [
            {
                "sender_type": message.sender_type,
                "message": message.message,
            }
            for message in previous_messages
        ]

        user_message = Message(
            conversation_id=conversation.id,
            sender_type="user",
            message=query,
        )

        db.add(user_message)
        await db.commit()

        assistant_result = (
            await AIAssistantService.answer(
                query=query,
                conversation_history=conversation_history,
            )
        )

        answer = assistant_result.get(
            "answer",
            "",
        )

        assistant_message = Message(
            conversation_id=conversation.id,
            sender_type="assistant",
            message=answer,
        )

        db.add(assistant_message)
        await db.commit()

        return {
            "conversation_id": str(
                conversation.id
            ),
            "query": query,
            "answer": answer,
            "sources": [],
            "mode": "assistant",
        }
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.conversation import Conversation


class ConversationService:

    @staticmethod
    async def create_conversation(
        db: AsyncSession,
        user_id: str,
        title: str,
    ) -> Conversation:

        conversation = Conversation(
            user_id=UUID(user_id),
            title=title,
        )

        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

        return conversation

    @staticmethod
    async def get_conversation(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
    ) -> Conversation | None:

        result = await db.execute(
            select(Conversation).where(
                Conversation.id == UUID(conversation_id),
                Conversation.user_id == UUID(user_id),
            )
        )

        return result.scalar_one_or_none()
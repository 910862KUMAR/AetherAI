from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.conversation import Conversation
from app.db.models.message import Message


class ConversationService:

    @staticmethod
    async def create_conversation(
        db: AsyncSession,
        user_id: str,
        title: str,
    ) -> Conversation:

        title = title.strip()

        if not title:
            raise ValueError(
                "Conversation title cannot be empty."
            )

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

    @staticmethod
    async def list_conversations(
        db: AsyncSession,
        user_id: str,
    ) -> list[Conversation]:

        result = await db.execute(
            select(Conversation)
            .where(
                Conversation.user_id == UUID(user_id)
            )
            .order_by(
                Conversation.created_at.desc()
            )
        )

        return list(result.scalars().all())

    @staticmethod
    async def delete_conversation(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
    ) -> bool:

        conversation = (
            await ConversationService.get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        if conversation is None:
            return False

        await db.execute(
            delete(Message).where(
                Message.conversation_id == conversation.id
            )
        )

        await db.delete(conversation)

        await db.commit()

        return True

    @staticmethod
    async def get_messages(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
    ) -> list[Message]:

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

        result = await db.execute(
            select(Message)
            .where(
                Message.conversation_id == conversation.id
            )
            .order_by(
                Message.created_at.asc()
            )
        )

        return list(result.scalars().all())
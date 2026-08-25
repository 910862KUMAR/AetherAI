from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.assistant_conversation import (
    AssistantConversation,
)
from app.db.models.assistant_message import (
    AssistantMessage,
)


class AssistantConversationService:

    @staticmethod
    def _generate_title(message: str) -> str:
        title = " ".join(message.strip().split())

        if not title:
            return "New conversation"

        if len(title) <= 60:
            return title

        truncated = title[:60].rsplit(" ", 1)[0]

        if not truncated:
            truncated = title[:60]

        return f"{truncated}..."

    @staticmethod
    async def create_conversation(
        db: AsyncSession,
        user_id: str,
        title: str = "New conversation",
    ) -> AssistantConversation:

        title = title.strip()

        if not title:
            raise ValueError(
                "Conversation title cannot be empty."
            )

        conversation = AssistantConversation(
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
    ) -> AssistantConversation | None:

        try:
            conversation_uuid = UUID(conversation_id)
            user_uuid = UUID(user_id)
        except ValueError:
            return None

        result = await db.execute(
            select(AssistantConversation).where(
                AssistantConversation.id
                == conversation_uuid,
                AssistantConversation.user_id
                == user_uuid,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def list_conversations(
        db: AsyncSession,
        user_id: str,
    ) -> list[AssistantConversation]:

        try:
            user_uuid = UUID(user_id)
        except ValueError as exc:
            raise ValueError(
                "Invalid user ID."
            ) from exc

        result = await db.execute(
            select(AssistantConversation)
            .where(
                AssistantConversation.user_id
                == user_uuid
            )
            .order_by(
                AssistantConversation.updated_at.desc()
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
            await AssistantConversationService
            .get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        if conversation is None:
            return False

        await db.execute(
            delete(AssistantMessage).where(
                AssistantMessage.conversation_id
                == conversation.id
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
    ) -> list[AssistantMessage]:

        conversation = (
            await AssistantConversationService
            .get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        if conversation is None:
            raise ValueError(
                "Assistant conversation not found."
            )

        result = await db.execute(
            select(AssistantMessage)
            .where(
                AssistantMessage.conversation_id
                == conversation.id
            )
            .order_by(
                AssistantMessage.created_at.asc()
            )
        )

        return list(result.scalars().all())

    @staticmethod
    async def add_message(
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
        sender_type: str,
        message: str,
        token_count: int = 0,
    ) -> AssistantMessage:

        conversation = (
            await AssistantConversationService
            .get_conversation(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id,
            )
        )

        if conversation is None:
            raise ValueError(
                "Assistant conversation not found."
            )

        message = message.strip()

        if not message:
            raise ValueError(
                "Message cannot be empty."
            )

        if sender_type not in {
            "user",
            "assistant",
        }:
            raise ValueError(
                "Invalid sender type."
            )

        if token_count < 0:
            raise ValueError(
                "Token count cannot be negative."
            )

        if (
            sender_type == "user"
            and conversation.title == "New conversation"
        ):
            conversation.title = (
                AssistantConversationService
                ._generate_title(message)
            )

        conversation.updated_at = func.now()

        assistant_message = AssistantMessage(
            conversation_id=conversation.id,
            sender_type=sender_type,
            message=message,
            token_count=token_count,
        )

        db.add(assistant_message)

        await db.commit()
        await db.refresh(assistant_message)

        return assistant_message

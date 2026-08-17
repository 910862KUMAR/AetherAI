from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.models.conversation import Conversation
from app.db.models.message import Message
from app.db.session.session import get_db


router = APIRouter()


@router.get("/conversations")
async def get_conversations(
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["sub"])

    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.user_id == user_id
        )
        .order_by(
            Conversation.created_at.desc()
        )
    )

    conversations = result.scalars().all()

    return [
        {
            "conversation_id": str(conversation.id),
            "title": conversation.title,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
        }
        for conversation in conversations
    ]


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["sub"])
    conversation_uuid = UUID(conversation_id)

    conversation_result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_uuid,
            Conversation.user_id == user_id,
        )
    )

    conversation = conversation_result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    result = await db.execute(
        select(Message)
        .where(
            Message.conversation_id == conversation_uuid
        )
        .order_by(
            Message.created_at.asc()
        )
    )

    messages = result.scalars().all()

    return [
        {
            "message_id": str(message.id),
            "sender_type": message.sender_type,
            "message": message.message,
            "token_count": message.token_count,
            "created_at": message.created_at,
        }
        for message in messages
    ]


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user["sub"])
    conversation_uuid = UUID(conversation_id)

    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_uuid,
            Conversation.user_id == user_id,
        )
    )

    conversation = result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    await db.delete(conversation)
    await db.commit()

    return {
        "message": "Conversation deleted successfully.",
        "conversation_id": conversation_id,
    }
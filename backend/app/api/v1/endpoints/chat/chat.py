from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.session.session import get_db
from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService


router = APIRouter()


class CreateConversationRequest(BaseModel):

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )


class ChatMessageRequest(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
    )


@router.post("/conversations")
async def create_conversation(
    request: CreateConversationRequest,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        conversation = (
            await ConversationService.create_conversation(
                db=db,
                user_id=current_user["sub"],
                title=request.title,
            )
        )

        return {
            "conversation_id": str(conversation.id),
            "title": conversation.title,
            "user_id": str(conversation.user_id),
            "created_at": conversation.created_at,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get("/conversations")
async def list_conversations(
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    conversations = (
        await ConversationService.list_conversations(
            db=db,
            user_id=current_user["sub"],
        )
    )

    return {
        "conversations": [
            {
                "conversation_id": str(conversation.id),
                "title": conversation.title,
                "created_at": conversation.created_at,
            }
            for conversation in conversations
        ]
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        messages = (
            await ConversationService.get_messages(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user["sub"],
            )
        )

        return {
            "conversation_id": conversation_id,
            "messages": [
                {
                    "message_id": str(message.id),
                    "sender_type": message.sender_type,
                    "message": message.message,
                    "created_at": message.created_at,
                }
                for message in messages
            ],
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    deleted = (
        await ConversationService.delete_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user["sub"],
        )
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    return {
        "conversation_id": conversation_id,
        "message": "Conversation deleted successfully.",
    }


@router.post("/{conversation_id}/message")
async def send_message(
    conversation_id: str,
    request: ChatMessageRequest,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await ChatService.chat(
            db=db,
            user_id=current_user["sub"],
            conversation_id=conversation_id,
            query=request.query,
            top_k=request.top_k,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )
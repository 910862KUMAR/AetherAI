from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.session.session import get_db
from app.services.ai_assistant_service import AIAssistantService
from app.services.assistant_conversation_service import (
    AssistantConversationService,
)


router = APIRouter()


class CreateAssistantConversationRequest(BaseModel):

    title: str = Field(
        default="New conversation",
        min_length=1,
        max_length=255,
    )


class AssistantMessageRequest(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )

    conversation_history: list[dict] | None = None


@router.post("/conversations")
async def create_assistant_conversation(
    request: CreateAssistantConversationRequest,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        conversation = (
            await AssistantConversationService
            .create_conversation(
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
            "updated_at": conversation.updated_at,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get("/conversations")
async def list_assistant_conversations(
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    conversations = (
        await AssistantConversationService
        .list_conversations(
            db=db,
            user_id=current_user["sub"],
        )
    )

    return {
        "conversations": [
            {
                "conversation_id": str(
                    conversation.id
                ),
                "title": conversation.title,
                "created_at": conversation.created_at,
                "updated_at": conversation.updated_at,
            }
            for conversation in conversations
        ]
    }


@router.get(
    "/conversations/{conversation_id}/messages"
)
async def get_assistant_conversation_messages(
    conversation_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        messages = (
            await AssistantConversationService
            .get_messages(
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


@router.delete(
    "/conversations/{conversation_id}"
)
async def delete_assistant_conversation(
    conversation_id: str,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    deleted = (
        await AssistantConversationService
        .delete_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user["sub"],
        )
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Assistant conversation not found.",
        )

    return {
        "conversation_id": conversation_id,
        "message": (
            "Assistant conversation "
            "deleted successfully."
        ),
    }


@router.post("/message")
async def send_assistant_message(
    request: AssistantMessageRequest,
    current_user: dict = CurrentUser,
):
    result = await AIAssistantService.answer(
        query=request.query,
        conversation_history=request.conversation_history,
    )

    return {
        "query": request.query,
        "answer": result["answer"],
        "mode": "assistant",
    }


@router.post(
    "/conversations/{conversation_id}/message"
)
async def send_assistant_conversation_message(
    conversation_id: str,
    request: AssistantMessageRequest,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    try:
        history = (
            await AssistantConversationService
            .get_messages(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user["sub"],
            )
        )

        conversation_history = [
            {
                "sender_type": message.sender_type,
                "message": message.message,
            }
            for message in history
        ]

        await AssistantConversationService.add_message(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user["sub"],
            sender_type="user",
            message=request.query,
        )

        result = await AIAssistantService.answer(
            query=request.query,
            conversation_history=conversation_history,
        )

        await AssistantConversationService.add_message(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user["sub"],
            sender_type="assistant",
            message=result["answer"],
        )

        return {
            "conversation_id": conversation_id,
            "query": request.query,
            "answer": result["answer"],
            "mode": "assistant",
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

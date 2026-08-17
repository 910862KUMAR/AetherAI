from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from pydantic import BaseModel
from pydantic import Field
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

        conversation = await ConversationService.create_conversation(
            db=db,
            user_id=current_user["sub"],
            title=request.title,
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
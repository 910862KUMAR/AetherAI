from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.session.session import get_db
from app.services.chat_service import ChatService


router = APIRouter()


class ChatMessageRequest(BaseModel):
    query: str


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
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )
from uuid import UUID

from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.api.v1.dependencies.auth import CurrentUser
from app.db.models.conversation import Conversation
from app.db.models.document import Document
from app.db.models.message import Message
from app.db.session.session import get_db


router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """
    Return dashboard statistics for the authenticated user.
    """

    user_id = UUID(current_user["sub"])

    # =========================================================
    # DOCUMENT STATISTICS
    # =========================================================

    document_result = await db.execute(
        select(
            func.count(Document.id),
            func.coalesce(func.sum(Document.file_size), 0),
            func.count(Document.id).filter(
                Document.is_processed.is_(True)
            ),
        ).where(
            Document.uploaded_by == user_id
        )
    )

    (
        document_count,
        total_storage_bytes,
        processed_document_count,
    ) = document_result.one()

    # =========================================================
    # CONVERSATION STATISTICS
    # =========================================================

    conversation_result = await db.execute(
        select(
            func.count(Conversation.id),
        ).where(
            Conversation.user_id == user_id
        )
    )

    conversation_count = conversation_result.scalar_one()

    # =========================================================
    # MESSAGE / AI REQUEST STATISTICS
    # =========================================================

    message_result = await db.execute(
        select(
            func.count(Message.id),
        )
        .join(
            Conversation,
            Message.conversation_id == Conversation.id,
        )
        .where(
            Conversation.user_id == user_id
        )
    )

    message_count = message_result.scalar_one()

    # =========================================================
    # KNOWLEDGE PROCESSING
    # =========================================================

    if document_count:
        knowledge_usage = round(
            (
                processed_document_count
                / document_count
            )
            * 100
        )
    else:
        knowledge_usage = 0

    # =========================================================
    # RESPONSE
    # =========================================================

    return {
        "documents": {
            "count": document_count,
            "processed": processed_document_count,
            "storage_bytes": total_storage_bytes,
        },
        "conversations": {
            "count": conversation_count,
        },
        "ai_requests": {
            "count": message_count,
        },
        "knowledge": {
            "usage_percent": knowledge_usage,
        },
    }
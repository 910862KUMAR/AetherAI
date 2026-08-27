from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import CurrentUser
from app.db.session.session import get_db
from app.services.rag.rag_service import RAGService


router = APIRouter()


class RAGRequest(BaseModel):

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


@router.post("/ask")
async def ask_rag(
    request: RAGRequest,
    current_user: dict = CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await RAGService.answer(
        db=db,
        query=request.query,
        user_id=current_user["sub"],
        top_k=request.top_k,
    )

    return {
        "query": request.query,
        "answer": result["answer"],
        "sources": result["sources"],
    }

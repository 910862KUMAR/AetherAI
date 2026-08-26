from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth.register_request import RegisterRequest
from app.schemas.auth.register_response import RegisterResponse
from app.services.auth.register_service import RegisterService


router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):

    try:

        return await RegisterService.register(
            db=db,
            full_name=request.full_name,
            email=request.email,
            password=request.password,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

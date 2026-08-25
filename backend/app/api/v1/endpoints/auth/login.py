from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth.login_request import LoginRequest
from app.schemas.auth.login_response import LoginResponse
from app.services.auth.login_service import LoginService


router = APIRouter()


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await LoginService.login(
            db=db,
            email=request.email,
            password=request.password,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
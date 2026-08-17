from fastapi import APIRouter
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth.login_response import LoginResponse
from app.services.auth.login_service import LoginService

router = APIRouter()


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=200,
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):

    return await LoginService.login(
        db=db,
        email=form_data.username,
        password=form_data.password,
    )
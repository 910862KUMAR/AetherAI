from fastapi import APIRouter

from app.services.auth.logout_service import LogoutService

router = APIRouter()


@router.post("/logout")
async def logout():

    return await LogoutService.logout()
from fastapi import APIRouter
from fastapi import HTTPException

from app.schemas.auth.refresh_request import RefreshRequest
from app.schemas.auth.refresh_response import RefreshResponse
from app.services.auth.refresh_service import RefreshService

router = APIRouter()


@router.post(
    "/refresh",
    response_model=RefreshResponse,
)
async def refresh_token(
    request: RefreshRequest,
):

    try:
        return await RefreshService.refresh_token(
            request.refresh_token,
        )

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )
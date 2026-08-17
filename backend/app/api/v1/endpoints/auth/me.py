from fastapi import APIRouter
from fastapi import Depends

# from app.security.auth.current_user import get_current_user

router = APIRouter()


@router.get("/me")
async def get_me():
    # current_user=Depends(get_current_user),
    return {"message": "User endpoint"}
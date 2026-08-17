from fastapi import Depends
from fastapi import HTTPException

from app.security.auth.current_user import get_current_user


def require_role(role: str):

    async def role_checker(
        current_user=Depends(get_current_user),
    ):

        if current_user.get("role") != role:
            raise HTTPException(
                status_code=403,
                detail="Permission denied",
            )

        return current_user

    return role_checker
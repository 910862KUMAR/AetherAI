from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.security.auth.jwt_handler import decode_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/token"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
):
    try:
        payload = decode_token(token)
        return payload
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

from app.schemas.auth.refresh_response import RefreshResponse
from app.security.auth.jwt_handler import (
    create_access_token,
    decode_token,
)


class RefreshService:

    @staticmethod
    async def refresh_token(
        refresh_token: str,
    ) -> RefreshResponse:

        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        access_token = create_access_token(
            {
                "sub": payload["sub"],
            }
        )

        return RefreshResponse(
            access_token=access_token,
        )
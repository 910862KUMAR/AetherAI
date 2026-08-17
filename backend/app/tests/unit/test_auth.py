import pytest

from app.security.auth.current_user import get_current_user
from app.security.auth.jwt_handler import create_access_token


@pytest.mark.asyncio
async def test_invalid_token_returns_401():

    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(
            token="invalid-token"
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid or expired token"


@pytest.mark.asyncio
async def test_valid_access_token_returns_payload():

    user_id = "test-user-id"

    token = create_access_token(
        data={
            "sub": user_id,
        }
    )

    payload = await get_current_user(
        token=token
    )

    assert payload["sub"] == user_id
    assert payload["type"] == "access"
    assert "exp" in payload
from uuid import UUID

from pydantic import BaseModel


class LoginResponse(BaseModel):
    """
    Login Response Schema
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"

    user_id: UUID
    full_name: str
    email: str
    is_active: bool
    is_verified: bool
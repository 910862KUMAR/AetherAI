from uuid import UUID

from pydantic import BaseModel, EmailStr


class RegisterResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    is_active: bool
    is_verified: bool

    model_config = {
        "from_attributes": True
    }
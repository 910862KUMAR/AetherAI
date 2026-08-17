from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import Field


class LoginRequest(BaseModel):
    """
    Login Request Schema
    """

    email: EmailStr = Field(
        ...,
        examples=["kumar@example.com"],
    )

    password: str = Field(
        ...,
        min_length=8,
        examples=["Kumar@123"],
    )
from pydantic import BaseModel


class RefreshResponse(BaseModel):
    """
    Refresh Token Response
    """

    access_token: str
    token_type: str = "bearer"
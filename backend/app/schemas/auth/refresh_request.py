from pydantic import BaseModel


class RefreshRequest(BaseModel):
    """
    Refresh Token Request
    """

    refresh_token: str
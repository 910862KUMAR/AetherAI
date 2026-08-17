from fastapi import Depends

from app.security.auth.current_user import get_current_user


CurrentUser = Depends(get_current_user)
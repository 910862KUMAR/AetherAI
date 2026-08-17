from fastapi import Depends

from app.core.dependencies.auth import get_current_user


CurrentUser = Depends(get_current_user)
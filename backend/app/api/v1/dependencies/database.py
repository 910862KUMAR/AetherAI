from fastapi import Depends

from app.db.session.session import get_db

DatabaseSession = Depends(get_db)


def get_database():
    return DatabaseSession
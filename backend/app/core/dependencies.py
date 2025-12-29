"""
Common dependencies
"""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User


def get_db_session() -> Session:
    """Get database session"""
    return Depends(get_db)


def get_current_user_dep() -> User:
    """Get current user dependency"""
    return Depends(get_current_user)


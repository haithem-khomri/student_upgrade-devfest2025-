"""
Commute mode router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.commute_service import CommuteService

router = APIRouter()


@router.get("/suggestions")
async def get_suggestions(
    time_available: int = 15,
    energy_level: str = "medium",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get commute mode suggestions"""
    service = CommuteService()
    suggestions = await service.get_suggestions(
        time_available=time_available,
        energy_level=energy_level,
        user_id=current_user.id,
    )
    return suggestions


@router.get("/podcasts")
async def get_podcasts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get available micro-podcasts"""
    service = CommuteService()
    podcasts = await service.get_podcasts(user_id=current_user.id)
    return podcasts


@router.get("/games")
async def get_games(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get available games"""
    service = CommuteService()
    games = await service.get_games()
    return games


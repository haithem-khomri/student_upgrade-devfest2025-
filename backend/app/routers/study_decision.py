"""
Study decision router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.schemas.study_decision import StudyDecisionRequest, StudyDecisionResponse
from app.services.study_decision_service import StudyDecisionService

router = APIRouter()


@router.post("/recommend", response_model=StudyDecisionResponse)
async def get_study_recommendation(
    request: StudyDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get AI-powered study recommendation"""
    service = StudyDecisionService()
    recommendation = await service.get_recommendation(request)
    return recommendation


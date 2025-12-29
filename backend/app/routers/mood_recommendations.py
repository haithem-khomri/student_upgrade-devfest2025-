"""
Mood-based Learning Recommendations Router
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.routers.auth import get_current_user
from app.models.user import User
from app.core.mongodb import MongoDB
from app.services.mood_recommendation_service import mood_recommendation_service

router = APIRouter()


class MoodAnalysisRequest(BaseModel):
    """Request for mood-based recommendations"""
    mood: str
    emotion: Optional[str] = None
    confidence: Optional[float] = None


@router.post("/recommendations")
async def get_mood_recommendations(
    request: MoodAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """Get personalized learning recommendations based on mood"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        
        # Get user data
        user = await db.users.find_one({"email": current_user.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_level = user.get("level") or current_user.level
        enrolled_modules = user.get("enrolled_modules", [])
        
        # Get recommendations
        recommendations = mood_recommendation_service.get_recommendations(
            mood=request.mood,
            user_level=user_level,
            enrolled_modules=enrolled_modules,
        )
        
        return {
            "success": True,
            "mood": request.mood,
            "emotion": request.emotion,
            "confidence": request.confidence,
            "recommendations": recommendations,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")


@router.get("/quick-suggestions")
async def get_quick_suggestions(
    mood: str,
    current_user: User = Depends(get_current_user),
):
    """Quick mood-based suggestions (simplified)"""
    try:
        recommendations = mood_recommendation_service.get_recommendations(
            mood=mood,
        )
        
        return {
            "success": True,
            "mood": mood,
            "suggestions": recommendations.get("suggestions", []),
            "study_session": recommendations.get("study_session", {}),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggestions: {str(e)}")


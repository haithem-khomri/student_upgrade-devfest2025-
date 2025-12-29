"""
Student Preferences and Scores Management Router
Allows students to manage their grades, preferences, and progress
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.mongodb import MongoDB
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


class DifficultyUpdate(BaseModel):
    """Update module difficulty rating"""
    difficulty: int = Field(ge=1, le=10, description="Difficulty rating from 1 to 10")


async def _update_difficulty(current_user: User, module_id: str, difficulty: int):
    """Helper function to update difficulty"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        
        # Get user
        user = await db.users.find_one({"email": current_user.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Initialize module_difficulties if not exists
        if "module_difficulties" not in user:
            user["module_difficulties"] = {}
        
        # Update difficulty for this module
        user["module_difficulties"][module_id] = difficulty
        
        # Update user in database
        await db.users.update_one(
            {"email": current_user.email},
            {"$set": {"module_difficulties": user["module_difficulties"]}}
        )
        
        return {
            "success": True,
            "module_id": module_id,
            "difficulty": difficulty
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preferences/{user_id}/difficulty/{module_id}")
async def update_module_difficulty(
    user_id: str,
    module_id: str,
    request: DifficultyUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update student's difficulty rating for a specific module"""
    # Verify user can only update their own preferences
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user's preferences")
    
    return await _update_difficulty(current_user, module_id, request.difficulty)


@router.get("/preferences/{user_id}/difficulty/{module_id}")
async def get_module_difficulty(
    user_id: str,
    module_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get student's difficulty rating for a specific module"""
    # Verify user can only get their own preferences
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's preferences")
    
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            return {"difficulty": None}
        
        module_difficulties = user.get("module_difficulties", {})
        difficulty = module_difficulties.get(module_id)
        
        return {"difficulty": difficulty}
    except HTTPException:
        raise
    except Exception as e:
        # Log error for debugging but return None to avoid breaking frontend
        import logging
        logging.error(f"Error getting module difficulty for user {current_user.email}, module {module_id}: {str(e)}")
        return {"difficulty": None}

# ============ SCHEMAS ============

class ScoreUpdate(BaseModel):
    """Update score for a module"""
    module_id: str
    score: float = Field(ge=0, le=20, description="Score out of 20")
    exam_type: str = Field(description="Type: 'midterm', 'final', 'td', 'project'")
    notes: Optional[str] = None

class PreferenceUpdate(BaseModel):
    """Update student preferences"""
    language: Optional[str] = None
    theme: Optional[str] = None
    notifications: Optional[bool] = None
    preferred_study_time: Optional[str] = None
    difficulty_preference: Optional[str] = Field(None, description="easy, medium, hard")

class ProgressUpdate(BaseModel):
    """Update progress for a module"""
    module_id: str
    courses_completed: Optional[int] = None
    tds_completed: Optional[int] = None
    overall_progress: Optional[int] = Field(None, ge=0, le=100)

# ============ SCORES/Grades ============

@router.post("/scores")
async def add_score(
    score: ScoreUpdate,
    current_user: User = Depends(get_current_user)
):
    """Add or update a score for a module"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        
        # Get user document
        user = await db.users.find_one({"email": current_user.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Initialize scores if not exists
        if "scores" not in user:
            user["scores"] = {}
        
        if score.module_id not in user["scores"]:
            user["scores"][score.module_id] = []
        
        # Add new score entry
        score_entry = {
            "score": score.score,
            "exam_type": score.exam_type,
            "notes": score.notes,
            "date": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        user["scores"][score.module_id].append(score_entry)
        
        # Calculate average for this module
        scores_list = user["scores"][score.module_id]
        avg_score = sum(s["score"] for s in scores_list) / len(scores_list)
        
        # Update user document
        await db.users.update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "scores": user["scores"],
                    f"scores_avg.{score.module_id}": round(avg_score, 2)
                }
            }
        )
        
        return {
            "success": True,
            "module_id": score.module_id,
            "score": score.score,
            "average": round(avg_score, 2),
            "total_scores": len(scores_list)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scores")
async def get_scores(current_user: User = Depends(get_current_user)):
    """Get all scores for the current user"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            return {"scores": {}, "averages": {}}
        
        scores = user.get("scores", {})
        averages = user.get("scores_avg", {})
        
        return {
            "scores": scores,
            "averages": averages,
            "total_modules_with_scores": len(scores)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scores/{module_id}")
async def get_module_scores(
    module_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get scores for a specific module"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        scores = user.get("scores", {}).get(module_id, [])
        average = user.get("scores_avg", {}).get(module_id, 0)
        
        return {
            "module_id": module_id,
            "scores": scores,
            "average": average,
            "count": len(scores)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ PREFERENCES ============

@router.get("/preferences")
async def get_preferences(current_user: User = Depends(get_current_user)):
    """Get student preferences"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            return {
                "language": "ar",
                "theme": "dark",
                "notifications": True,
                "preferred_study_time": None,
                "difficulty_preference": "medium"
            }
        
        preferences = user.get("preferences", {})
        
        # Set defaults
        default_prefs = {
            "language": "ar",
            "theme": "dark",
            "notifications": True,
            "preferred_study_time": None,
            "difficulty_preference": "medium"
        }
        
        return {**default_prefs, **preferences}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/preferences")
async def update_preferences(
    prefs: PreferenceUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update student preferences"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get current preferences
        current_prefs = user.get("preferences", {})
        
        # Update only provided fields
        update_data = {}
        if prefs.language is not None:
            update_data["preferences.language"] = prefs.language
        if prefs.theme is not None:
            update_data["preferences.theme"] = prefs.theme
        if prefs.notifications is not None:
            update_data["preferences.notifications"] = prefs.notifications
        if prefs.preferred_study_time is not None:
            update_data["preferences.preferred_study_time"] = prefs.preferred_study_time
        if prefs.difficulty_preference is not None:
            update_data["preferences.difficulty_preference"] = prefs.difficulty_preference
        
        if update_data:
            await db.users.update_one(
                {"email": current_user.email},
                {"$set": update_data}
            )
        
        # Return updated preferences
        updated_user = await db.users.find_one({"email": current_user.email})
        return updated_user.get("preferences", {})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ PROGRESS ============

@router.put("/progress")
async def update_progress(
    progress: ProgressUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update progress for a module"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Initialize progress if not exists
        if "progress" not in user:
            user["progress"] = {}
        
        if progress.module_id not in user["progress"]:
            user["progress"][progress.module_id] = {}
        
        # Update progress fields
        update_data = {}
        if progress.courses_completed is not None:
            update_data[f"progress.{progress.module_id}.courses_completed"] = progress.courses_completed
        if progress.tds_completed is not None:
            update_data[f"progress.{progress.module_id}.tds_completed"] = progress.tds_completed
        if progress.overall_progress is not None:
            update_data[f"progress.{progress.module_id}.overall_progress"] = progress.overall_progress
        
        update_data[f"progress.{progress.module_id}.updated_at"] = datetime.utcnow()
        
        if update_data:
            await db.users.update_one(
                {"email": current_user.email},
                {"$set": update_data}
            )
        
        # Return updated progress
        updated_user = await db.users.find_one({"email": current_user.email})
        return updated_user.get("progress", {}).get(progress.module_id, {})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress")
async def get_progress(current_user: User = Depends(get_current_user)):
    """Get all progress for the current user"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            return {"progress": {}}
        
        return {
            "progress": user.get("progress", {}),
            "total_modules": len(user.get("progress", {}))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_student_stats(current_user: User = Depends(get_current_user)):
    """Get comprehensive student statistics"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = MongoDB.get_db()
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            return {
                "total_modules": 0,
                "average_score": 0,
                "total_scores": 0,
                "modules_in_progress": 0
            }
        
        scores = user.get("scores", {})
        progress = user.get("progress", {})
        averages = user.get("scores_avg", {})
        
        # Calculate statistics
        total_modules = len(user.get("enrolled_modules", []))
        total_scores = sum(len(scores_list) for scores_list in scores.values())
        
        # Calculate overall average
        if averages:
            avg_values = [v for v in averages.values() if v > 0]
            overall_avg = sum(avg_values) / len(avg_values) if avg_values else 0
        else:
            overall_avg = 0
        
        # Count modules in progress
        modules_in_progress = sum(
            1 for p in progress.values()
            if p.get("overall_progress", 0) > 0 and p.get("overall_progress", 0) < 100
        )
        
        return {
            "total_modules": total_modules,
            "average_score": round(overall_avg, 2),
            "total_scores": total_scores,
            "modules_in_progress": modules_in_progress,
            "modules_completed": sum(
                1 for p in progress.values()
                if p.get("overall_progress", 0) >= 100
            ),
            "scores_by_module": averages
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


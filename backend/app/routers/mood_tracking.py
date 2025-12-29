"""
Mood Tracking Router
Handles mood detection, storage, and analysis endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import logging

from app.routers.auth import get_current_user
from app.models.user import User
from app.core.mongodb import MongoDB
from app.services.mood_tracking_service import mood_tracking_service
from app.services.ai.face_service import face_service

logger = logging.getLogger(__name__)

router = APIRouter()


class MoodEntryRequest(BaseModel):
    """Request to store a mood entry"""
    emotion: str = Field(..., description="Detected emotion")
    mood: str = Field(..., description="Categorized mood")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence")
    source: Optional[str] = Field("face_detection", description="Source of mood detection")
    metadata: Optional[Dict] = Field(None, description="Additional metadata")


class MoodAnalysisRequest(BaseModel):
    """Request for face analysis with mood tracking"""
    image: str = Field(..., description="Base64 encoded image")
    track_mood: Optional[bool] = Field(True, description="Whether to store mood in history")


@router.post("/track")
async def track_mood(
    request: MoodEntryRequest,
    current_user: User = Depends(get_current_user)
):
    """Store a mood entry in the database"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Create mood entry
        mood_entry = mood_tracking_service.create_mood_entry(
            user_email=current_user.email,
            emotion=request.emotion,
            mood=request.mood,
            confidence=request.confidence,
            source=request.source,
            metadata=request.metadata,
        )
        
        # Store in database
        await db.mood_history.insert_one(mood_entry)
        
        return {
            'success': True,
            'message': 'Mood tracked successfully',
            'mood_entry': {
                'emotion': mood_entry['emotion'],
                'mood': mood_entry['mood'],
                'confidence': mood_entry['confidence'],
                'timestamp': mood_entry['timestamp'].isoformat(),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking mood for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error tracking mood: {str(e)}")


@router.post("/analyze-and-track")
async def analyze_and_track_mood(
    request: MoodAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze face and optionally track mood"""
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image is required")
        
        # Analyze face
        result = face_service.process_face_image(request.image)
        
        if not result or not result.get('success'):
            return {
                'face_detected': False,
                'face_count': 0,
                'error': result.get('error', 'Face detection failed') if result else 'Face service error',
            }
        
        if not result.get('faces'):
            return {
                'face_detected': False,
                'face_count': 0,
                'error': 'No faces detected',
            }
        
        # Extract emotions and mood from first face
        first_face = result['faces'][0]
        emotions_data = first_face.get('emotions', {})
        
        emotion = emotions_data.get('emotion', 'neutral')
        mood = emotions_data.get('mood', 'neutral')
        confidence = emotions_data.get('confidence', 0.0)
        
        # Track mood if requested
        mood_entry_id = None
        if request.track_mood:
            try:
                db = MongoDB.get_db()
                if db and await MongoDB.check_connection():
                    mood_entry = mood_tracking_service.create_mood_entry(
                        user_email=current_user.email,
                        emotion=emotion,
                        mood=mood,
                        confidence=confidence,
                        source='face_detection',
                        metadata={
                            'face_confidence': first_face.get('confidence', 0.0),
                            'all_emotions': emotions_data.get('all_emotions', {}),
                        }
                    )
                    insert_result = await db.mood_history.insert_one(mood_entry)
                    mood_entry_id = str(insert_result.inserted_id)
            except Exception as e:
                logger.warning(f"Failed to track mood: {e}")
        
        return {
            'face_detected': True,
            'face_count': result.get('face_count', 0),
            'emotion': emotion,
            'mood': mood,
            'confidence': confidence,
            'all_emotions': emotions_data.get('all_emotions', {}),
            'mood_tracked': mood_entry_id is not None,
            'mood_entry_id': mood_entry_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing and tracking mood for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error analyzing face: {str(e)}")


@router.get("/history")
async def get_mood_history(
    days: Optional[int] = Query(7, ge=1, le=365, description="Number of days to retrieve"),
    limit: Optional[int] = Query(100, ge=1, le=1000, description="Maximum number of entries"),
    current_user: User = Depends(get_current_user)
):
    """Get mood history for the current user"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Query mood history
        cursor = db.mood_history.find({
            'user_email': current_user.email,
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', -1).limit(limit)
        
        mood_history = []
        async for entry in cursor:
            # Convert ObjectId and datetime to strings
            entry['_id'] = str(entry['_id'])
            entry['timestamp'] = entry['timestamp'].isoformat()
            mood_history.append(entry)
        
        # Analyze mood history
        # Convert back to datetime for analysis
        history_for_analysis = []
        for entry in mood_history:
            entry_copy = entry.copy()
            entry_copy['timestamp'] = datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00'))
            history_for_analysis.append(entry_copy)
        
        analysis = mood_tracking_service.analyze_mood_history(history_for_analysis)
        insights = mood_tracking_service.get_mood_insights(history_for_analysis)
        
        return {
            'success': True,
            'mood_history': mood_history,
            'analysis': analysis,
            'insights': insights,
            'total_entries': len(mood_history),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting mood history for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting mood history: {str(e)}")


@router.get("/stats")
async def get_mood_stats(
    days: Optional[int] = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user)
):
    """Get mood statistics and insights"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Query all mood history
        cursor = db.mood_history.find({
            'user_email': current_user.email,
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', -1)
        
        mood_history = []
        async for entry in cursor:
            entry_copy = entry.copy()
            entry_copy['_id'] = str(entry['_id'])
            entry_copy['timestamp'] = entry['timestamp'].isoformat()
            mood_history.append(entry_copy)
        
        # Convert back to datetime for analysis
        history_for_analysis = []
        for entry in mood_history:
            entry_copy = entry.copy()
            entry_copy['timestamp'] = datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00'))
            history_for_analysis.append(entry_copy)
        
        # Analyze
        analysis = mood_tracking_service.analyze_mood_history(history_for_analysis)
        insights = mood_tracking_service.get_mood_insights(history_for_analysis)
        
        return {
            'success': True,
            'stats': analysis,
            'insights': insights,
            'period_days': days,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting mood stats for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting mood stats: {str(e)}")


@router.delete("/history")
async def clear_mood_history(
    days: Optional[int] = Query(None, description="Clear history older than X days. If None, clears all"),
    current_user: User = Depends(get_current_user)
):
    """Clear mood history (optional: only older than X days)"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        query = {'user_email': current_user.email}
        if days:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            query['timestamp'] = {'$lt': cutoff_date}
        
        result = await db.mood_history.delete_many(query)
        
        return {
            'success': True,
            'message': f'Deleted {result.deleted_count} mood entries',
            'deleted_count': result.deleted_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing mood history for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error clearing mood history: {str(e)}")


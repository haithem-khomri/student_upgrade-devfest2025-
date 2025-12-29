"""
Face Recognition Router
Handles face detection, verification, and emotion detection endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import base64
import logging

from app.routers.auth import get_current_user
from app.models.user import User
from app.core.mongodb import MongoDB
from app.services.ai.face_service import face_service
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


class FaceDetectionRequest(BaseModel):
    """Request for face detection"""
    image: str = Field(..., description="Base64 encoded image")


class FaceVerificationRequest(BaseModel):
    """Request for face verification"""
    image: str = Field(..., description="Base64 encoded image to verify")
    reference_embedding: Optional[List[float]] = Field(None, description="Reference face embedding")
    threshold: Optional[float] = Field(0.6, description="Similarity threshold (0-1)")


class FaceRegistrationRequest(BaseModel):
    """Request to register a user's face"""
    image: str = Field(..., description="Base64 encoded face image")
    poster_image: Optional[str] = Field(None, description="Base64 encoded poster/reference image")


@router.post("/detect")
async def detect_faces(
    request: FaceDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """Detect faces in an image"""
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image is required")
        
        result = face_service.process_face_image(request.image)
        if not result:
            raise HTTPException(status_code=500, detail="Face service returned no result")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error detecting faces for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error detecting faces: {str(e)}")


@router.post("/verify")
async def verify_face(
    request: FaceVerificationRequest,
    current_user: User = Depends(get_current_user)
):
    """Verify if a face matches a reference embedding"""
    # Check MongoDB connection and attempt reconnection if needed
    if not MongoDB.is_connected():
        logger.warning("MongoDB not connected, attempting to reconnect...")
        await MongoDB.connect()
    
    # Verify connection is actually working
    if not await MongoDB.check_connection():
        logger.error("MongoDB connection check failed")
        raise HTTPException(
            status_code=503, 
            detail="MongoDB service unavailable. Please check your database connection."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get user's stored face embedding
        user = await db.users.find_one({"email": current_user.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        stored_embedding = user.get("face_embedding")
        
        if not stored_embedding and not request.reference_embedding:
            raise HTTPException(
                status_code=400,
                detail="No face embedding found. Please register your face first."
            )
        
        # Process the new image
        result = face_service.process_face_image(request.image)
        
        if not result.get('success') or not result.get('faces'):
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        face_data = result['faces'][0]
        new_embedding = face_data.get('embedding')
        
        if not new_embedding:
            raise HTTPException(status_code=400, detail="Could not extract face embedding")
        
        # Use reference embedding or stored embedding
        reference = request.reference_embedding or stored_embedding
        
        # Verify faces
        verification = face_service.verify_faces(
            new_embedding,
            reference,
            threshold=request.threshold
        )
        
        return {
            'verified': verification['is_match'],
            'similarity': verification['similarity'],
            'confidence': verification['confidence'],
            'emotions': face_data.get('emotions', {}),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying face: {str(e)}")


@router.post("/register")
async def register_face(
    request: FaceRegistrationRequest,
    current_user: User = Depends(get_current_user)
):
    """Register a user's face for verification"""
    # Check MongoDB connection and attempt reconnection if needed
    if not MongoDB.is_connected():
        logger.warning("MongoDB not connected, attempting to reconnect...")
        await MongoDB.connect()
    
    # Verify connection is actually working
    if not await MongoDB.check_connection():
        logger.error("MongoDB connection check failed")
        raise HTTPException(
            status_code=503, 
            detail="MongoDB service unavailable. Please check your database connection."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Process the face image
        result = face_service.process_face_image(request.image)
        
        if not result.get('success') or not result.get('faces'):
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        if len(result['faces']) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Please use an image with only one face.")
        
        face_data = result['faces'][0]
        embedding = face_data.get('embedding')
        emotions = face_data.get('emotions', {})
        
        if not embedding:
            raise HTTPException(status_code=400, detail="Could not extract face embedding")
        
        # If poster image provided, verify it matches
        poster_verified = False
        if request.poster_image:
            poster_result = face_service.process_face_image(request.poster_image)
            if poster_result.get('success') and poster_result.get('faces'):
                poster_embedding = poster_result['faces'][0].get('embedding')
                if poster_embedding:
                    verification = face_service.verify_faces(embedding, poster_embedding)
                    poster_verified = verification['is_match']
        
        # Store face embedding in user document
        await db.users.update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "face_embedding": embedding,
                    "face_registered_at": datetime.utcnow(),
                    "face_verified_with_poster": poster_verified,
                }
            }
        )
        
        return {
            'success': True,
            'message': 'Face registered successfully',
            'poster_verified': poster_verified,
            'emotions': emotions,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering face: {str(e)}")


@router.get("/status")
async def get_face_status(
    current_user: User = Depends(get_current_user)
):
    """Get user's face registration status"""
    try:
        if not MongoDB.is_connected():
            # Return default status if MongoDB not connected
            logger.warning("MongoDB not connected, returning default face status")
            return {
                'registered': False,
                'registered_at': None,
                'poster_verified': False,
            }
        
        db = MongoDB.get_db()
        if not db:
            logger.warning("MongoDB database not available, returning default face status")
            return {
                'registered': False,
                'registered_at': None,
                'poster_verified': False,
            }
        
        user = await db.users.find_one({"email": current_user.email})
        
        if not user:
            # User not found in database, return default status
            logger.warning(f"User {current_user.email} not found in database")
            return {
                'registered': False,
                'registered_at': None,
                'poster_verified': False,
            }
        
        has_face = user.get("face_embedding") is not None
        registered_at = user.get("face_registered_at")
        poster_verified = user.get("face_verified_with_poster", False)
        
        # Handle datetime serialization
        registered_at_str = None
        if registered_at:
            if isinstance(registered_at, datetime):
                registered_at_str = registered_at.isoformat()
            elif hasattr(registered_at, 'isoformat'):
                registered_at_str = registered_at.isoformat()
            else:
                registered_at_str = str(registered_at)
        
        return {
            'registered': has_face,
            'registered_at': registered_at_str,
            'poster_verified': poster_verified,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting face status for user {current_user.email}: {e}", exc_info=True)
        # Return default status instead of raising error
        return {
            'registered': False,
            'registered_at': None,
            'poster_verified': False,
            'error': str(e) if logger.level <= logging.DEBUG else None,
        }


@router.post("/analyze")
async def analyze_face(
    request: FaceDetectionRequest,
    current_user: User = Depends(get_current_user),
    track_mood: bool = True
):
    """Complete face analysis: detection + emotions + mood (optionally tracks mood)"""
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image is required")
        
        result = face_service.process_face_image(request.image)
        
        if not result:
            raise HTTPException(status_code=500, detail="Face service returned no result")
        
        if not result.get('success'):
            return {
                'face_detected': False,
                'face_count': 0,
                'error': result.get('error', 'Face detection failed'),
            }
        
        # Extract emotions and mood from first face
        analysis = {
            'face_detected': len(result.get('faces', [])) > 0,
            'face_count': result.get('face_count', 0),
        }
        
        if result.get('faces'):
            first_face = result['faces'][0]
            emotions_data = first_face.get('emotions', {})
            emotion = emotions_data.get('emotion', 'neutral')
            mood = emotions_data.get('mood', 'neutral')
            confidence = emotions_data.get('confidence', 0.0)
            
            analysis.update({
                'emotion': emotion,
                'emotions': emotions_data,
                'mood': mood,
                'confidence': first_face.get('confidence', 0.0),
                'emotion_confidence': confidence,
            })
            
            # Optionally track mood in database
            if track_mood:
                try:
                    from app.services.mood_tracking_service import mood_tracking_service
                    if await MongoDB.check_connection():
                        db = MongoDB.get_db()
                        if db:
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
                            await db.mood_history.insert_one(mood_entry)
                            analysis['mood_tracked'] = True
                except Exception as e:
                    logger.warning(f"Failed to track mood: {e}")
                    analysis['mood_tracked'] = False
        else:
            analysis.update({
                'emotion': 'unknown',
                'emotions': {},
                'mood': 'unknown',
                'confidence': 0.0,
                'emotion_confidence': 0.0,
            })
        
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing face for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error analyzing face: {str(e)}")


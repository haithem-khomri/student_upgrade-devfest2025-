"""
Mood-Based Study Program Router
Generates personalized study programs based on mood history
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import logging

from app.routers.auth import get_current_user
from app.models.user import User
from app.core.mongodb import MongoDB
from app.services.mood_based_program_service import mood_based_program_service
from app.services.mood_tracking_service import mood_tracking_service

logger = logging.getLogger(__name__)

router = APIRouter()


class GenerateProgramRequest(BaseModel):
    """Request to generate a mood-based study program"""
    days: int = Field(7, ge=1, le=30, description="Number of days for the program")
    include_modules: Optional[List[str]] = Field(None, description="Specific module IDs to include")


@router.post("/generate")
async def generate_mood_based_program(
    request: GenerateProgramRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate a personalized study program based on mood history"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    try:
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Get mood history (last 30 days)
        start_date = datetime.utcnow() - timedelta(days=30)
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
        
        # Get user's enrolled modules
        user = await db.users.find_one({"email": current_user.email})
        enrolled_modules = user.get("enrolled_modules", []) if user else []
        
        # If specific modules requested, filter
        if request.include_modules:
            enrolled_modules = [
                m for m in enrolled_modules 
                if str(m.get('_id', '')) in request.include_modules or m.get('id') in request.include_modules
            ]
        
        # Generate program
        program = mood_based_program_service.generate_program(
            user_email=current_user.email,
            mood_history=history_for_analysis,
            available_modules=enrolled_modules,
            days=request.days
        )
        
        # Store program in database
        program_doc = program.copy()
        program_doc['created_at'] = datetime.utcnow()
        program_doc['status'] = 'active'
        insert_result = await db.study_programs.insert_one(program_doc)
        program['_id'] = str(insert_result.inserted_id)
        
        return {
            'success': True,
            'program': program,
            'message': 'Study program generated successfully',
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating program for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating program: {str(e)}")


@router.get("/programs")
async def get_study_programs(
    active_only: bool = Query(True, description="Return only active programs"),
    current_user: User = Depends(get_current_user)
):
    """Get user's study programs"""
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
        if active_only:
            query['status'] = 'active'
        
        cursor = db.study_programs.find(query).sort('created_at', -1)
        
        programs = []
        async for program in cursor:
            program['_id'] = str(program['_id'])
            if isinstance(program.get('created_at'), datetime):
                program['created_at'] = program['created_at'].isoformat()
            programs.append(program)
        
        return {
            'success': True,
            'programs': programs,
            'count': len(programs),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting programs for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting programs: {str(e)}")


@router.get("/programs/{program_id}")
async def get_study_program(
    program_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific study program"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    try:
        from bson import ObjectId
        
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        program = await db.study_programs.find_one({
            '_id': ObjectId(program_id),
            'user_email': current_user.email
        })
        
        if not program:
            raise HTTPException(status_code=404, detail="Program not found")
        
        program['_id'] = str(program['_id'])
        if isinstance(program.get('created_at'), datetime):
            program['created_at'] = program['created_at'].isoformat()
        
        return {
            'success': True,
            'program': program,
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid program ID")
    except Exception as e:
        logger.error(f"Error getting program {program_id} for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting program: {str(e)}")


@router.put("/programs/{program_id}/status")
async def update_program_status(
    program_id: str,
    status: str = Query(..., description="New status: active, completed, paused"),
    current_user: User = Depends(get_current_user)
):
    """Update study program status"""
    if not await MongoDB.check_connection():
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable. Please try again later."
        )
    
    if status not in ['active', 'completed', 'paused']:
        raise HTTPException(status_code=400, detail="Invalid status. Must be: active, completed, or paused")
    
    try:
        from bson import ObjectId
        
        db = MongoDB.get_db()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        result = await db.study_programs.update_one(
            {
                '_id': ObjectId(program_id),
                'user_email': current_user.email
            },
            {
                '$set': {
                    'status': status,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Program not found")
        
        return {
            'success': True,
            'message': f'Program status updated to {status}',
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid program ID")
    except Exception as e:
        logger.error(f"Error updating program {program_id} for user {current_user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating program: {str(e)}")


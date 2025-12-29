"""
Resources router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.resource import Resource, ResourceRating
from app.schemas.resources import (
    ResourceResponse,
    ResourceRatingRequest,
    ResourceRecommendationRequest,
)
from app.services.resource_service import ResourceService

router = APIRouter()


@router.post("/recommend", response_model=List[ResourceResponse])
async def get_recommendations(
    request: ResourceRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get personalized resource recommendations"""
    service = ResourceService()
    resources = await service.get_recommendations(
        user_id=current_user.id,
        module_id=request.moduleId,
        limit=request.limit,
        db=db,
    )
    return resources


@router.get("", response_model=List[ResourceResponse])
async def get_all_resources(
    module_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all resources, optionally filtered by module"""
    query = db.query(Resource)
    if module_id:
        query = query.filter(Resource.module_id == module_id)
    
    resources = query.limit(100).all()
    
    # Get user ratings
    user_ratings = {
        r.resource_id: r.rating
        for r in db.query(ResourceRating)
        .filter(ResourceRating.user_id == current_user.id)
        .all()
    }
    
    result = []
    for resource in resources:
        resource_dict = {
            "id": resource.id,
            "title": resource.title,
            "type": resource.type,
            "url": resource.url,
            "moduleId": resource.module_id or "",
            "moduleName": None,  # Would need to join with modules table
            "rating": resource.average_rating if resource.average_rating > 0 else None,
            "userRating": user_ratings.get(resource.id),
            "description": resource.description,
            "tags": [],
        }
        result.append(ResourceResponse(**resource_dict))
    
    return result


@router.post("/{resource_id}/rate")
async def rate_resource(
    resource_id: str,
    rating_data: ResourceRatingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rate a resource"""
    # Check if resource exists
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Check if rating is valid
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if user already rated
    existing_rating = (
        db.query(ResourceRating)
        .filter(
            ResourceRating.user_id == current_user.id,
            ResourceRating.resource_id == resource_id,
        )
        .first()
    )
    
    if existing_rating:
        existing_rating.rating = rating_data.rating
    else:
        new_rating = ResourceRating(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            resource_id=resource_id,
            rating=rating_data.rating,
            created_at=datetime.utcnow().isoformat(),
        )
        db.add(new_rating)
    
    # Update average rating
    all_ratings = db.query(ResourceRating).filter(ResourceRating.resource_id == resource_id).all()
    if all_ratings:
        resource.average_rating = sum(r.rating for r in all_ratings) / len(all_ratings)
        resource.rating_count = len(all_ratings)
    
    db.commit()
    return {"message": "Rating saved"}


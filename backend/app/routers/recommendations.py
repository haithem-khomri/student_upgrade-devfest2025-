"""
Recommendations API Router

Netflix-style recommendation system endpoints:
- Rate resources
- Get personalized recommendations
- Get trending resources
- Get top rated resources
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.recommendation_service import get_recommendation_service

router = APIRouter()


class RatingRequest(BaseModel):
    user_id: str
    resource_id: str
    rating: float = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    module_id: Optional[str] = None


class RatingResponse(BaseModel):
    success: bool
    rating: float
    message: str = "Rating saved successfully"


class ResourceResponse(BaseModel):
    id: str
    title: str
    type: str
    url: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    average_rating: float = 0
    rating_count: int = 0
    recommendation_score: Optional[float] = None
    recommendation_type: Optional[str] = None
    tags: Optional[List[str]] = None


@router.post("/rate", response_model=RatingResponse)
async def rate_resource(request: RatingRequest):
    """
    Rate a learning resource (1-5 stars)
    
    This rating is used to:
    - Calculate average ratings for resources
    - Generate personalized recommendations
    - Find similar users for collaborative filtering
    """
    service = get_recommendation_service()
    
    result = await service.rate_resource(
        user_id=request.user_id,
        resource_id=request.resource_id,
        rating=request.rating,
        module_id=request.module_id
    )
    
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    
    return RatingResponse(
        success=True,
        rating=request.rating
    )


@router.get("/user/{user_id}/rating/{resource_id}")
async def get_user_rating(user_id: str, resource_id: str):
    """Get a user's rating for a specific resource"""
    service = get_recommendation_service()
    
    rating = await service.get_user_rating(user_id, resource_id)
    
    return {
        "user_id": user_id,
        "resource_id": resource_id,
        "rating": rating
    }


@router.get("/user/{user_id}/ratings")
async def get_all_user_ratings(user_id: str):
    """Get all ratings by a user"""
    service = get_recommendation_service()
    
    ratings = await service.get_user_ratings(user_id)
    
    return {
        "user_id": user_id,
        "ratings": ratings,
        "total": len(ratings)
    }


@router.get("/user/{user_id}/recommendations")
async def get_recommendations(
    user_id: str,
    module_id: Optional[str] = None,
    limit: int = 10
):
    """
    Get personalized recommendations for a user
    
    Uses Netflix-style hybrid recommendation:
    - Collaborative filtering (based on similar users)
    - Content-based filtering (based on module/course)
    - Trending resources
    """
    service = get_recommendation_service()
    
    recommendations = await service.get_recommendations_for_user(
        user_id=user_id,
        module_id=module_id,
        limit=limit
    )
    
    return {
        "user_id": user_id,
        "module_id": module_id,
        "recommendations": recommendations,
        "total": len(recommendations)
    }


@router.get("/trending")
async def get_trending(module_id: Optional[str] = None, limit: int = 10):
    """
    Get trending resources
    
    Based on:
    - Recent rating activity
    - High average ratings
    """
    service = get_recommendation_service()
    
    trending = await service.get_trending_resources(
        module_id=module_id,
        limit=limit
    )
    
    return {
        "trending": trending,
        "total": len(trending)
    }


@router.get("/top-rated")
async def get_top_rated(module_id: Optional[str] = None, limit: int = 10):
    """
    Get top rated resources
    
    Sorted by:
    - Average rating (descending)
    - Rating count (descending)
    """
    service = get_recommendation_service()
    
    resources = await service.get_top_rated_resources(
        module_id=module_id,
        limit=limit
    )
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/module/{module_id}/resources")
async def get_module_resources(module_id: str):
    """Get all resources for a specific module with ratings"""
    from app.core.mongodb import MongoDB
    
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="Database not connected")
    
    db = MongoDB.get_db()
    
    resources = []
    async for resource in db.resources.find({"module_id": module_id}).sort("average_rating", -1):
        resources.append({
            "id": resource.get("id"),
            "title": resource.get("title"),
            "type": resource.get("type"),
            "url": resource.get("url"),
            "description": resource.get("description"),
            "thumbnail": resource.get("thumbnail"),
            "duration": resource.get("duration"),
            "channel": resource.get("channel"),
            "average_rating": resource.get("average_rating", 0),
            "rating_count": resource.get("rating_count", 0),
            "tags": resource.get("tags", [])
        })
    
    return {
        "module_id": module_id,
        "resources": resources,
        "total": len(resources)
    }


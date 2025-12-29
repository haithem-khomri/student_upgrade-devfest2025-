"""
Resource schemas
"""
from pydantic import BaseModel
from typing import Optional, List


class ResourceResponse(BaseModel):
    id: str
    title: str
    type: str
    url: str
    moduleId: str
    moduleName: Optional[str] = None
    rating: Optional[float] = None
    userRating: Optional[int] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

    class Config:
        from_attributes = True


class ResourceRatingRequest(BaseModel):
    rating: int  # 1-5


class ResourceRecommendationRequest(BaseModel):
    moduleId: Optional[str] = None
    limit: int = 20


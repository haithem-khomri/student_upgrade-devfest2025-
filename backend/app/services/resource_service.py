"""
Resource Service - For resource recommendations using embeddings
"""
from typing import List, Optional
from sqlalchemy.orm import Session
import json

from app.models.resource import Resource, ResourceRating
from app.schemas.resources import ResourceResponse
# NOTE: Embedding service disabled - install sentence-transformers to enable
# from app.services.ai.embedding_service import EmbeddingService


class ResourceService:
    """Service for resource recommendations"""
    
    def __init__(self):
        # Embedding service disabled for now
        self.embedding_service = None
    
    async def get_recommendations(
        self,
        user_id: str,
        module_id: Optional[str],
        limit: int,
        db: Session,
    ) -> List[ResourceResponse]:
        """Get personalized resource recommendations"""
        # Get all resources (or filtered by module)
        query = db.query(Resource)
        if module_id:
            query = query.filter(Resource.module_id == module_id)
        
        resources = query.limit(limit * 2).all()  # Get more for filtering
        
        # Get user's ratings
        user_ratings = {
            r.resource_id: r.rating
            for r in db.query(ResourceRating)
            .filter(ResourceRating.user_id == user_id)
            .all()
        }
        
        # Score and rank resources
        scored_resources = []
        for resource in resources:
            score = self._calculate_resource_score(resource, user_ratings.get(resource.id))
            scored_resources.append((resource, score))
        
        # Sort by score and take top N
        scored_resources.sort(key=lambda x: x[1], reverse=True)
        top_resources = scored_resources[:limit]
        
        # Convert to response format
        result = []
        for resource, score in top_resources:
            tags = []
            if resource.tags:
                try:
                    tags = json.loads(resource.tags)
                except:
                    pass
            
            result.append(
                ResourceResponse(
                    id=resource.id,
                    title=resource.title,
                    type=resource.type,
                    url=resource.url,
                    moduleId=resource.module_id or "",
                    moduleName=None,  # Would need join
                    rating=resource.average_rating if resource.average_rating > 0 else None,
                    userRating=user_ratings.get(resource.id),
                    description=resource.description,
                    tags=tags,
                )
            )
        
        return result
    
    def _calculate_resource_score(
        self, resource: Resource, user_rating: Optional[int]
    ) -> float:
        """Calculate recommendation score for a resource"""
        score = 0.0
        
        # Base score from average rating
        if resource.average_rating and resource.average_rating > 0:
            score += resource.average_rating * 20  # Scale 1-5 to 20-100
        
        # Boost if user has rated it highly
        if user_rating and user_rating >= 4:
            score += 30
        
        # Boost if many ratings (popularity)
        if resource.rating_count and resource.rating_count >= 10:
            score += 10
        
        # Type preference (could be personalized)
        type_scores = {
            "video": 1.1,
            "pdf": 1.0,
            "article": 0.9,
            "link": 0.8,
        }
        score *= type_scores.get(resource.type, 1.0)
        
        return score


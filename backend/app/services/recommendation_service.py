"""
Netflix-style Recommendation Service

Features:
- Collaborative filtering based on user ratings
- Content-based recommendations
- Trending resources
- Personalized suggestions
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from collections import defaultdict
import math

from app.core.mongodb import MongoDB


class RecommendationService:
    """Netflix-style recommendation engine for learning resources"""
    
    def __init__(self):
        self.min_ratings_for_recommendation = 3
    
    async def get_db(self):
        """Get database connection"""
        if not MongoDB.is_connected():
            return None
        return MongoDB.get_db()
    
    # ==================== Rating Operations ====================
    
    async def rate_resource(
        self, 
        user_id: str, 
        resource_id: str, 
        rating: float,
        module_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Rate a resource (1-5 stars)
        Updates both the user's rating and the resource's average
        """
        db = await self.get_db()
        if db is None:
            return {"error": "Database not connected"}
        
        # Validate rating
        if rating < 1 or rating > 5:
            return {"error": "Rating must be between 1 and 5"}
        
        # Save/update user rating
        rating_doc = {
            "user_id": user_id,
            "resource_id": resource_id,
            "module_id": module_id,
            "rating": rating,
            "updated_at": datetime.utcnow()
        }
        
        await db.user_ratings.update_one(
            {"user_id": user_id, "resource_id": resource_id},
            {"$set": rating_doc, "$setOnInsert": {"created_at": datetime.utcnow()}},
            upsert=True
        )
        
        # Update resource average rating
        await self._update_resource_average(db, resource_id)
        
        return {"success": True, "rating": rating}
    
    async def get_user_rating(self, user_id: str, resource_id: str) -> Optional[float]:
        """Get a user's rating for a specific resource"""
        db = await self.get_db()
        if db is None:
            return None
        
        rating = await db.user_ratings.find_one({
            "user_id": user_id,
            "resource_id": resource_id
        })
        
        return rating.get("rating") if rating else None
    
    async def get_user_ratings(self, user_id: str) -> List[Dict]:
        """Get all ratings by a user"""
        db = await self.get_db()
        if db is None:
            return []
        
        ratings = []
        async for rating in db.user_ratings.find({"user_id": user_id}):
            ratings.append({
                "resource_id": rating.get("resource_id"),
                "rating": rating.get("rating"),
                "module_id": rating.get("module_id")
            })
        
        return ratings
    
    async def _update_resource_average(self, db, resource_id: str):
        """Update the average rating for a resource"""
        pipeline = [
            {"$match": {"resource_id": resource_id}},
            {"$group": {
                "_id": "$resource_id",
                "average": {"$avg": "$rating"},
                "count": {"$sum": 1}
            }}
        ]
        
        result = await db.user_ratings.aggregate(pipeline).to_list(1)
        
        if result:
            await db.resources.update_one(
                {"id": resource_id},
                {"$set": {
                    "average_rating": round(result[0]["average"], 1),
                    "rating_count": result[0]["count"]
                }}
            )
    
    # ==================== Recommendation Algorithms ====================
    
    async def get_recommendations_for_user(
        self, 
        user_id: str, 
        module_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get personalized recommendations for a user
        Uses hybrid approach: collaborative + content-based filtering
        """
        db = await self.get_db()
        if db is None:
            return []
        
        # Get user's ratings
        user_ratings = await self.get_user_ratings(user_id)
        rated_resource_ids = {r["resource_id"] for r in user_ratings}
        
        recommendations = []
        
        # 1. Collaborative filtering - find similar users
        if len(user_ratings) >= self.min_ratings_for_recommendation:
            similar_users = await self._find_similar_users(db, user_id, user_ratings)
            cf_recommendations = await self._get_collaborative_recommendations(
                db, similar_users, rated_resource_ids, module_id
            )
            recommendations.extend(cf_recommendations)
        
        # 2. Content-based - recommend from same modules
        if module_id:
            content_recommendations = await self._get_content_based_recommendations(
                db, module_id, rated_resource_ids
            )
            recommendations.extend(content_recommendations)
        
        # 3. Add trending resources
        trending = await self.get_trending_resources(module_id, limit=5)
        for resource in trending:
            if resource.get("id") not in rated_resource_ids:
                resource["recommendation_type"] = "trending"
                recommendations.append(resource)
        
        # Remove duplicates and sort by score
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec.get("id") not in seen:
                seen.add(rec.get("id"))
                unique_recommendations.append(rec)
        
        # Sort by recommendation score
        unique_recommendations.sort(
            key=lambda x: x.get("recommendation_score", 0), 
            reverse=True
        )
        
        return unique_recommendations[:limit]
    
    async def _find_similar_users(
        self, 
        db, 
        user_id: str, 
        user_ratings: List[Dict]
    ) -> List[Dict]:
        """Find users with similar rating patterns using cosine similarity"""
        user_rating_map = {r["resource_id"]: r["rating"] for r in user_ratings}
        
        # Get all other users who rated the same resources
        similar_users = []
        
        async for other_user in db.user_ratings.aggregate([
            {"$match": {"user_id": {"$ne": user_id}}},
            {"$group": {
                "_id": "$user_id",
                "ratings": {"$push": {"resource_id": "$resource_id", "rating": "$rating"}}
            }}
        ]):
            other_rating_map = {r["resource_id"]: r["rating"] for r in other_user["ratings"]}
            
            # Calculate cosine similarity
            similarity = self._cosine_similarity(user_rating_map, other_rating_map)
            
            if similarity > 0.3:  # Threshold for similarity
                similar_users.append({
                    "user_id": other_user["_id"],
                    "similarity": similarity,
                    "ratings": other_rating_map
                })
        
        # Sort by similarity
        similar_users.sort(key=lambda x: x["similarity"], reverse=True)
        
        return similar_users[:10]  # Top 10 similar users
    
    def _cosine_similarity(self, ratings1: Dict, ratings2: Dict) -> float:
        """Calculate cosine similarity between two rating vectors"""
        common_items = set(ratings1.keys()) & set(ratings2.keys())
        
        if len(common_items) < 2:
            return 0.0
        
        # Calculate dot product and magnitudes
        dot_product = sum(ratings1[item] * ratings2[item] for item in common_items)
        mag1 = math.sqrt(sum(ratings1[item] ** 2 for item in common_items))
        mag2 = math.sqrt(sum(ratings2[item] ** 2 for item in common_items))
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
        
        return dot_product / (mag1 * mag2)
    
    async def _get_collaborative_recommendations(
        self, 
        db, 
        similar_users: List[Dict],
        rated_resource_ids: set,
        module_id: Optional[str]
    ) -> List[Dict]:
        """Get recommendations based on similar users' ratings"""
        recommendations = []
        resource_scores = defaultdict(lambda: {"score": 0, "count": 0})
        
        for user in similar_users:
            for resource_id, rating in user["ratings"].items():
                if resource_id not in rated_resource_ids and rating >= 4:
                    weighted_score = rating * user["similarity"]
                    resource_scores[resource_id]["score"] += weighted_score
                    resource_scores[resource_id]["count"] += 1
        
        # Get resource details
        for resource_id, data in resource_scores.items():
            avg_score = data["score"] / data["count"] if data["count"] > 0 else 0
            
            resource = await db.resources.find_one({"id": resource_id})
            if resource:
                if module_id and resource.get("module_id") != module_id:
                    continue
                
                recommendations.append({
                    "id": resource.get("id"),
                    "title": resource.get("title"),
                    "type": resource.get("type"),
                    "url": resource.get("url"),
                    "description": resource.get("description"),
                    "thumbnail": resource.get("thumbnail"),
                    "average_rating": resource.get("average_rating", 0),
                    "rating_count": resource.get("rating_count", 0),
                    "recommendation_score": avg_score,
                    "recommendation_type": "collaborative"
                })
        
        return recommendations
    
    async def _get_content_based_recommendations(
        self, 
        db, 
        module_id: str,
        rated_resource_ids: set
    ) -> List[Dict]:
        """Get recommendations based on module content"""
        recommendations = []
        
        async for resource in db.resources.find({
            "module_id": module_id,
            "id": {"$nin": list(rated_resource_ids)}
        }).sort("average_rating", -1).limit(10):
            recommendations.append({
                "id": resource.get("id"),
                "title": resource.get("title"),
                "type": resource.get("type"),
                "url": resource.get("url"),
                "description": resource.get("description"),
                "thumbnail": resource.get("thumbnail"),
                "average_rating": resource.get("average_rating", 0),
                "rating_count": resource.get("rating_count", 0),
                "recommendation_score": resource.get("average_rating", 0) * 0.8,
                "recommendation_type": "content"
            })
        
        return recommendations
    
    async def get_trending_resources(
        self, 
        module_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Get trending resources based on recent ratings"""
        db = await self.get_db()
        if db is None:
            return []
        
        # Get resources with most ratings in last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        pipeline = [
            {"$match": {"updated_at": {"$gte": week_ago}}},
            {"$group": {
                "_id": "$resource_id",
                "recent_ratings": {"$sum": 1},
                "avg_rating": {"$avg": "$rating"}
            }},
            {"$match": {"avg_rating": {"$gte": 3.5}}},
            {"$sort": {"recent_ratings": -1, "avg_rating": -1}},
            {"$limit": limit * 2}
        ]
        
        trending_ids = []
        async for item in db.user_ratings.aggregate(pipeline):
            trending_ids.append(item["_id"])
        
        # Get resource details
        trending = []
        query = {"id": {"$in": trending_ids}}
        if module_id:
            query["module_id"] = module_id
        
        async for resource in db.resources.find(query).limit(limit):
            trending.append({
                "id": resource.get("id"),
                "title": resource.get("title"),
                "type": resource.get("type"),
                "url": resource.get("url"),
                "description": resource.get("description"),
                "thumbnail": resource.get("thumbnail"),
                "average_rating": resource.get("average_rating", 0),
                "rating_count": resource.get("rating_count", 0),
                "tags": resource.get("tags", [])
            })
        
        return trending
    
    async def get_top_rated_resources(
        self, 
        module_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Get top rated resources"""
        db = await self.get_db()
        if db is None:
            return []
        
        query = {"rating_count": {"$gte": 3}}  # At least 3 ratings
        if module_id:
            query["module_id"] = module_id
        
        resources = []
        async for resource in db.resources.find(query).sort([
            ("average_rating", -1),
            ("rating_count", -1)
        ]).limit(limit):
            resources.append({
                "id": resource.get("id"),
                "title": resource.get("title"),
                "type": resource.get("type"),
                "url": resource.get("url"),
                "description": resource.get("description"),
                "thumbnail": resource.get("thumbnail"),
                "average_rating": resource.get("average_rating", 0),
                "rating_count": resource.get("rating_count", 0),
                "tags": resource.get("tags", [])
            })
        
        return resources


# Singleton instance
_recommendation_service: Optional[RecommendationService] = None

def get_recommendation_service() -> RecommendationService:
    """Get or create recommendation service instance"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service


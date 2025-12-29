"""
Commute Service - For commute mode features
"""
from typing import List, Dict, Any


class CommuteService:
    """Service for commute mode features"""
    
    async def get_suggestions(
        self,
        time_available: int,
        energy_level: str,
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """Get commute mode suggestions"""
        suggestions = []
        
        # Podcast suggestion
        if time_available >= 10 and energy_level in ["medium", "high"]:
            suggestions.append({
                "id": "1",
                "activity": "Listen to a podcast",
                "reason": f"Perfect for {time_available} minutes",
                "icon": "headphones",
            })
        
        # Flashcard suggestion
        if energy_level == "low":
            suggestions.append({
                "id": "2",
                "activity": "Review flashcards",
                "reason": "Low energy friendly",
                "icon": "lightbulb",
            })
        
        # Game suggestion
        if time_available >= 5:
            suggestions.append({
                "id": "3",
                "activity": "Quick logic game",
                "reason": "Engaging and short",
                "icon": "gamepad",
            })
        
        return suggestions
    
    async def get_podcasts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get available micro-podcasts"""
        # In production, these would be generated or fetched from database
        return [
            {
                "id": "1",
                "title": "Quick Math Review",
                "duration": 10,
                "topic": "Mathematics",
                "url": "/podcasts/math-review.mp3",
            },
            {
                "id": "2",
                "title": "Physics Concepts",
                "duration": 15,
                "topic": "Physics",
                "url": "/podcasts/physics-concepts.mp3",
            },
            {
                "id": "3",
                "title": "CS Fundamentals",
                "duration": 12,
                "topic": "Computer Science",
                "url": "/podcasts/cs-fundamentals.mp3",
            },
        ]
    
    async def get_games(self) -> List[Dict[str, Any]]:
        """Get available games"""
        return [
            {
                "id": "1",
                "name": "Memory Challenge",
                "type": "memory",
                "difficulty": "easy",
            },
            {
                "id": "2",
                "name": "Logic Puzzle",
                "type": "logic",
                "difficulty": "medium",
            },
            {
                "id": "3",
                "name": "Quick Quiz",
                "type": "quiz",
                "difficulty": "easy",
            },
        ]


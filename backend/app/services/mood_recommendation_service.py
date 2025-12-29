"""
Mood-based Learning Recommendation Service
Provides personalized learning suggestions based on detected mood
"""
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class MoodRecommendationService:
    """Service for generating mood-based learning recommendations"""
    
    def __init__(self):
        self.mood_recommendations = {
            "positive": {
                "title": "مزاج إيجابي! وقت رائع للتعلم",
                "description": "أنت في حالة ممتازة للتعلم. استفد من طاقتك الإيجابية!",
                "suggestions": [
                    {
                        "type": "challenge",
                        "title": "تحديات صعبة",
                        "description": "جرب مواد أكثر صعوبة أو مشاريع جديدة",
                        "icon": "🎯",
                        "priority": "high",
                    },
                    {
                        "type": "new_content",
                        "title": "محتوى جديد",
                        "description": "استكشف مواد جديدة أو مواضيع متقدمة",
                        "icon": "✨",
                        "priority": "high",
                    },
                    {
                        "type": "creative",
                        "title": "مشاريع إبداعية",
                        "description": "ابدأ مشروعاً إبداعياً أو تطبيقاً عملياً",
                        "icon": "🚀",
                        "priority": "medium",
                    },
                ],
                "modules_priority": "difficult",  # Suggest harder modules
                "study_duration": "long",  # Can handle longer study sessions
            },
            "negative": {
                "title": "مزاج منخفض - دعنا نساعدك",
                "description": "نفهم أنك قد تشعر بالإرهاق. إليك خيارات أسهل وأكثر راحة",
                "suggestions": [
                    {
                        "type": "review",
                        "title": "مراجعة المواد السهلة",
                        "description": "راجع مواد مألوفة لتعزيز ثقتك",
                        "icon": "📚",
                        "priority": "high",
                    },
                    {
                        "type": "short_session",
                        "title": "جلسات قصيرة",
                        "description": "جلسات دراسة قصيرة (15-20 دقيقة)",
                        "icon": "⏱️",
                        "priority": "high",
                    },
                    {
                        "type": "video",
                        "title": "محتوى مرئي",
                        "description": "شاهد فيديوهات تعليمية بدلاً من القراءة",
                        "icon": "🎥",
                        "priority": "medium",
                    },
                    {
                        "type": "break",
                        "title": "استراحة قصيرة",
                        "description": "خذ استراحة ثم عد للدراسة لاحقاً",
                        "icon": "☕",
                        "priority": "medium",
                    },
                ],
                "modules_priority": "easy",  # Suggest easier modules
                "study_duration": "short",  # Shorter study sessions
            },
            "calm": {
                "title": "مزاج هادئ - وقت مثالي للتركيز",
                "description": "أنت في حالة تركيز جيدة. مثالي للدراسة العميقة",
                "suggestions": [
                    {
                        "type": "deep_learning",
                        "title": "تعلم عميق",
                        "description": "ركز على مواضيع معقدة تحتاج تركيز",
                        "icon": "🧠",
                        "priority": "high",
                    },
                    {
                        "type": "reading",
                        "title": "قراءة متعمقة",
                        "description": "اقرأ محتوى أكاديمي أو أوراق بحثية",
                        "icon": "📖",
                        "priority": "high",
                    },
                    {
                        "type": "practice",
                        "title": "تمارين عملية",
                        "description": "حل تمارين ومسائل تطبيقية",
                        "icon": "✍️",
                        "priority": "medium",
                    },
                ],
                "modules_priority": "moderate",  # Moderate difficulty
                "study_duration": "medium",  # Medium study sessions
            },
            "neutral": {
                "title": "مزاج عادي - خيارات متنوعة",
                "description": "أنت في حالة متوازنة. يمكنك اختيار ما يناسبك",
                "suggestions": [
                    {
                        "type": "balanced",
                        "title": "مزيج متوازن",
                        "description": "جرب مزيجاً من المواد السهلة والصعبة",
                        "icon": "⚖️",
                        "priority": "high",
                    },
                    {
                        "type": "interactive",
                        "title": "محتوى تفاعلي",
                        "description": "جرب بطاقات تعليمية أو اختبارات",
                        "icon": "🎴",
                        "priority": "medium",
                    },
                    {
                        "type": "planning",
                        "title": "تخطيط",
                        "description": "خطط لدراستك القادمة",
                        "icon": "📅",
                        "priority": "medium",
                    },
                ],
                "modules_priority": "balanced",  # Mix of difficulties
                "study_duration": "flexible",  # Flexible duration
            },
        }
    
    def get_recommendations(
        self,
        mood: str,
        user_level: Optional[str] = None,
        enrolled_modules: Optional[List[Dict]] = None,
    ) -> Dict:
        """
        Get personalized learning recommendations based on mood
        
        Args:
            mood: Detected mood (positive, negative, calm, neutral)
            user_level: User's academic level (L1, L2, M1, etc.)
            enrolled_modules: List of enrolled modules
        
        Returns:
            Dictionary with recommendations and suggestions
        """
        mood = mood.lower()
        
        # Default to neutral if mood not recognized
        if mood not in self.mood_recommendations:
            mood = "neutral"
        
        base_recommendation = self.mood_recommendations[mood].copy()
        
        # Filter modules based on mood priority
        recommended_modules = self._filter_modules_by_mood(
            mood, enrolled_modules or []
        )
        
        # Add module recommendations
        base_recommendation["recommended_modules"] = recommended_modules[:3]  # Top 3
        
        # Add study session recommendations
        base_recommendation["study_session"] = self._get_study_session_recommendation(
            mood
        )
        
        return base_recommendation
    
    def _filter_modules_by_mood(
        self, mood: str, modules: List[Dict]
    ) -> List[Dict]:
        """Filter and sort modules based on mood priority"""
        if not modules:
            return []
        
        # Sort modules by difficulty
        modules_with_difficulty = []
        for module in modules:
            difficulty = module.get("difficulty", 5)  # Default to medium
            modules_with_difficulty.append((module, difficulty))
        
        # Sort based on mood
        if mood == "positive":
            # Prefer harder modules
            modules_with_difficulty.sort(key=lambda x: x[1], reverse=True)
        elif mood == "negative":
            # Prefer easier modules
            modules_with_difficulty.sort(key=lambda x: x[1])
        elif mood == "calm":
            # Prefer moderate difficulty
            modules_with_difficulty.sort(
                key=lambda x: abs(x[1] - 5)
            )  # Closest to 5 (medium)
        else:  # neutral
            # Balanced mix
            pass
        
        return [module for module, _ in modules_with_difficulty]
    
    def _get_study_session_recommendation(self, mood: str) -> Dict:
        """Get study session recommendations based on mood"""
        session_recommendations = {
            "positive": {
                "duration_minutes": 90,
                "break_interval": 30,
                "intensity": "high",
                "focus_areas": ["new_concepts", "challenging_problems"],
            },
            "negative": {
                "duration_minutes": 20,
                "break_interval": 10,
                "intensity": "low",
                "focus_areas": ["review", "easy_practice"],
            },
            "calm": {
                "duration_minutes": 60,
                "break_interval": 20,
                "intensity": "medium",
                "focus_areas": ["deep_reading", "problem_solving"],
            },
            "neutral": {
                "duration_minutes": 45,
                "break_interval": 15,
                "intensity": "medium",
                "focus_areas": ["balanced_mix"],
            },
        }
        
        return session_recommendations.get(mood, session_recommendations["neutral"])


# Global instance
mood_recommendation_service = MoodRecommendationService()


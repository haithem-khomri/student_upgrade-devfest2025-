"""
Study Decision Service - Core logic for study recommendations
"""
from typing import Dict, List
from datetime import datetime, timedelta
import math

from app.schemas.study_decision import StudyDecisionRequest, StudyDecisionResponse
from app.services.ai.llm_service import LLMService


class StudyDecisionService:
    """Service for AI-powered study decision making"""
    
    def __init__(self):
        self.llm_service = LLMService()
    
    async def get_recommendation(
        self, request: StudyDecisionRequest
    ) -> StudyDecisionResponse:
        """
        Get study recommendation using rule-based scoring + AI explanation
        
        This is NOT a pure LLM decision - we use scoring logic for decisions,
        LLM only for explanations.
        """
        # Calculate scores for each module
        module_scores = []
        
        for module in request.modules:
            score = self._calculate_module_score(module, request)
            module_scores.append({
                "module": module,
                "score": score,
            })
        
        # Sort by score (highest first)
        module_scores.sort(key=lambda x: x["score"], reverse=True)
        
        # Get top recommendation
        top_module_data = module_scores[0]
        recommended_module = top_module_data["module"]
        
        # Determine activity based on mood, energy, and time
        recommended_activity = self._determine_activity(
            request.mood,
            request.energyLevel,
            request.timeAvailable,
        )
        
        # Calculate suggested duration
        suggested_duration = self._calculate_duration(
            request.timeAvailable,
            request.energyLevel,
            recommended_activity,
        )
        
        # Generate AI explanation
        explanation = await self._generate_explanation(
            recommended_module,
            recommended_activity,
            suggested_duration,
            request,
            top_module_data["score"],
        )
        
        # Calculate confidence (based on score difference)
        confidence = self._calculate_confidence(module_scores)
        
        return StudyDecisionResponse(
            recommendedModule={
                "id": recommended_module.id,
                "name": recommended_module.name,
                "reason": self._get_reason(recommended_module, request),
            },
            recommendedActivity=recommended_activity,
            suggestedDuration=suggested_duration,
            explanation=explanation,
            confidence=confidence,
        )
    
    def _calculate_module_score(self, module, request) -> float:
        """Calculate priority score for a module"""
        score = 0.0
        
        # Base difficulty (higher difficulty = higher priority if energy is high)
        difficulty_weight = 1.0
        if request.energyLevel >= 7:
            difficulty_weight = 1.5
        elif request.energyLevel <= 4:
            difficulty_weight = 0.5
        
        score += module.difficulty * difficulty_weight * 10
        
        # Exam date proximity (closer exam = higher priority)
        if module.examDate:
            try:
                exam_date = datetime.fromisoformat(module.examDate.replace("Z", "+00:00"))
                days_until_exam = (exam_date - datetime.now()).days
                
                if days_until_exam > 0:
                    # Exponential decay: closer exams get much higher priority
                    proximity_score = 100 / (1 + days_until_exam / 7)  # Decay over 7 days
                    score += proximity_score
            except:
                pass
        
        # Progress (lower progress = higher priority)
        if module.progress is not None:
            progress_deficit = 100 - module.progress
            score += progress_deficit * 0.5
        
        # Mood adjustment
        mood_multiplier = {
            "low": 0.7,
            "medium": 1.0,
            "high": 1.3,
        }
        score *= mood_multiplier.get(request.mood, 1.0)
        
        # Energy adjustment
        energy_multiplier = request.energyLevel / 10.0
        score *= energy_multiplier
        
        return score
    
    def _determine_activity(
        self, mood: str, energy_level: int, time_available: int
    ) -> str:
        """Determine best activity based on context"""
        # Low energy or short time -> flashcards
        if energy_level <= 4 or time_available <= 30:
            return "flashcards"
        
        # High energy and long time -> practice
        if energy_level >= 7 and time_available >= 90:
            return "practice"
        
        # Medium conditions -> revise
        if time_available >= 60:
            return "revise"
        
        # Default -> summary
        return "summary"
    
    def _calculate_duration(
        self, time_available: int, energy_level: int, activity: str
    ) -> int:
        """Calculate suggested duration"""
        # Base duration on available time
        base_duration = min(time_available, 120)  # Cap at 2 hours
        
        # Adjust for energy
        if energy_level <= 4:
            base_duration = int(base_duration * 0.7)  # Shorter if low energy
        elif energy_level >= 8:
            base_duration = int(base_duration * 1.1)  # Slightly longer if high energy
        
        # Adjust for activity type
        activity_multipliers = {
            "flashcards": 0.8,
            "summary": 0.9,
            "revise": 1.0,
            "practice": 1.1,
        }
        
        duration = int(base_duration * activity_multipliers.get(activity, 1.0))
        
        # Round to nearest 5 minutes
        return max(15, (duration // 5) * 5)
    
    async def _generate_explanation(
        self,
        module,
        activity,
        duration,
        request,
        score: float,
    ) -> str:
        """Generate AI explanation for the recommendation"""
        prompt = f"""Explain why a student should study {module.name} now, using {activity} for {duration} minutes.
        
Context:
- Mood: {request.mood}
- Energy Level: {request.energyLevel}/10
- Time Available: {request.timeAvailable} minutes
- Module Difficulty: {module.difficulty}/10
- Priority Score: {score:.1f}

Provide a brief, encouraging explanation (2-3 sentences)."""
        
        explanation = await self.llm_service.chat_completion(
            message=prompt,
            short_answer=True,
        )
        
        return explanation
    
    def _get_reason(self, module, request) -> str:
        """Get reason for module recommendation"""
        reasons = []
        
        if module.examDate:
            try:
                exam_date = datetime.fromisoformat(module.examDate.replace("Z", "+00:00"))
                days = (exam_date - datetime.now()).days
                if days > 0 and days <= 14:
                    reasons.append(f"Exam in {days} days")
            except:
                pass
        
        if module.progress is not None and module.progress < 50:
            reasons.append("Low progress")
        
        if module.difficulty >= 7:
            reasons.append("High difficulty")
        
        if not reasons:
            reasons.append("Good time to review")
        
        return "; ".join(reasons)
    
    def _calculate_confidence(self, module_scores: List[Dict]) -> float:
        """Calculate confidence based on score separation"""
        if len(module_scores) < 2:
            return 0.8
        
        top_score = module_scores[0]["score"]
        second_score = module_scores[1]["score"]
        
        if top_score == 0:
            return 0.5
        
        # Confidence based on how much higher the top score is
        score_ratio = (top_score - second_score) / top_score
        confidence = min(0.95, 0.6 + score_ratio * 0.35)
        
        return confidence


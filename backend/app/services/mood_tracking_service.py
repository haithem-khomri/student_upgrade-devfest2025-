"""
Mood Tracking Service
Tracks and analyzes student moods over time for personalized learning
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from collections import Counter

logger = logging.getLogger(__name__)


class MoodTrackingService:
    """Service for tracking and analyzing student moods"""
    
    def __init__(self):
        self.mood_categories = {
            'positive': ['happy', 'excited', 'confident', 'energetic'],
            'negative': ['sad', 'angry', 'fear', 'anxious', 'stressed', 'tired'],
            'calm': ['calm', 'relaxed', 'peaceful', 'focused'],
            'neutral': ['neutral', 'indifferent', 'normal'],
        }
    
    def categorize_mood(self, emotion: str, mood: Optional[str] = None) -> str:
        """
        Categorize emotion into mood category
        
        Args:
            emotion: Detected emotion (e.g., 'happy', 'sad')
            mood: Pre-categorized mood if available
        
        Returns:
            Mood category: 'positive', 'negative', 'calm', or 'neutral'
        """
        if mood and mood.lower() in self.mood_categories:
            return mood.lower()
        
        emotion_lower = emotion.lower() if emotion else 'neutral'
        
        for category, emotions in self.mood_categories.items():
            if emotion_lower in emotions:
                return category
        
        return 'neutral'
    
    def create_mood_entry(
        self,
        user_email: str,
        emotion: str,
        mood: str,
        confidence: float,
        source: str = 'face_detection',
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create a mood tracking entry
        
        Args:
            user_email: User's email
            emotion: Detected emotion
            mood: Categorized mood
            confidence: Detection confidence (0-1)
            source: Source of mood detection
            metadata: Additional metadata
        
        Returns:
            Mood entry dictionary
        """
        categorized_mood = self.categorize_mood(emotion, mood)
        
        entry = {
            'user_email': user_email,
            'emotion': emotion.lower(),
            'mood': categorized_mood,
            'confidence': float(confidence),
            'source': source,
            'timestamp': datetime.utcnow(),
            'metadata': metadata or {},
        }
        
        return entry
    
    def analyze_mood_history(self, mood_history: List[Dict]) -> Dict:
        """
        Analyze mood history to find patterns
        
        Args:
            mood_history: List of mood entries
        
        Returns:
            Analysis results with patterns and insights
        """
        if not mood_history:
            return {
                'total_entries': 0,
                'most_common_mood': 'neutral',
                'mood_distribution': {},
                'average_confidence': 0.0,
                'trend': 'stable',
            }
        
        # Count moods
        mood_counts = Counter([entry['mood'] for entry in mood_history])
        most_common_mood = mood_counts.most_common(1)[0][0] if mood_counts else 'neutral'
        
        # Calculate average confidence
        confidences = [entry.get('confidence', 0.0) for entry in mood_history]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        # Calculate mood distribution
        total = len(mood_history)
        mood_distribution = {
            mood: (count / total) * 100 
            for mood, count in mood_counts.items()
        }
        
        # Determine trend (last 5 entries vs previous 5)
        trend = 'stable'
        if len(mood_history) >= 10:
            recent = mood_history[-5:]
            previous = mood_history[-10:-5]
            
            recent_positive = sum(1 for e in recent if e['mood'] == 'positive')
            previous_positive = sum(1 for e in previous if e['mood'] == 'positive')
            
            if recent_positive > previous_positive:
                trend = 'improving'
            elif recent_positive < previous_positive:
                trend = 'declining'
        
        # Time-based analysis
        recent_entries = [e for e in mood_history 
                         if (datetime.utcnow() - e['timestamp']).days <= 7]
        recent_mood = Counter([e['mood'] for e in recent_entries])
        most_recent_mood = recent_mood.most_common(1)[0][0] if recent_mood else most_common_mood
        
        return {
            'total_entries': total,
            'most_common_mood': most_common_mood,
            'recent_mood': most_recent_mood,
            'mood_distribution': mood_distribution,
            'average_confidence': avg_confidence,
            'trend': trend,
            'recent_entries_count': len(recent_entries),
        }
    
    def get_mood_insights(self, mood_history: List[Dict]) -> List[str]:
        """
        Generate insights from mood history
        
        Args:
            mood_history: List of mood entries
        
        Returns:
            List of insight messages
        """
        insights = []
        
        if not mood_history:
            return ["لا توجد بيانات مزاجية متاحة بعد"]
        
        analysis = self.analyze_mood_history(mood_history)
        
        # Trend insights
        if analysis['trend'] == 'improving':
            insights.append("مزاجك يتحسن! استمر في ذلك 🎉")
        elif analysis['trend'] == 'declining':
            insights.append("لاحظنا انخفاضاً في مزاجك. قد تحتاج لاستراحة")
        
        # Distribution insights
        positive_pct = analysis['mood_distribution'].get('positive', 0)
        negative_pct = analysis['mood_distribution'].get('negative', 0)
        
        if positive_pct > 60:
            insights.append("لديك مزاج إيجابي معظم الوقت! رائع 👏")
        elif negative_pct > 40:
            insights.append("لاحظنا مزاجاً سلبياً متكرراً. قد تحتاج دعم إضافي")
        
        # Confidence insights
        if analysis['average_confidence'] < 0.5:
            insights.append("دقة كشف المزاج منخفضة. تأكد من إضاءة جيدة للكاميرا")
        
        return insights


# Global instance
mood_tracking_service = MoodTrackingService()


"""
Mood-Based Study Program Generator
Creates personalized study programs based on mood history and patterns
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

from app.services.mood_tracking_service import mood_tracking_service

logger = logging.getLogger(__name__)


class MoodBasedProgramService:
    """Service for generating mood-based study programs"""
    
    def __init__(self):
        self.program_templates = {
            'positive': {
                'name': 'برنامج التعلم المكثف',
                'description': 'برنامج مكثف للاستفادة من طاقتك الإيجابية',
                'daily_duration_minutes': 120,
                'session_duration_minutes': 45,
                'break_duration_minutes': 15,
                'focus_areas': ['new_concepts', 'challenging_problems', 'projects'],
                'difficulty_level': 'high',
                'modules_count': 3,
            },
            'negative': {
                'name': 'برنامج التعلم المرن',
                'description': 'برنامج مرن يراعي حالتك المزاجية',
                'daily_duration_minutes': 30,
                'session_duration_minutes': 15,
                'break_duration_minutes': 10,
                'focus_areas': ['review', 'easy_practice', 'videos'],
                'difficulty_level': 'low',
                'modules_count': 1,
            },
            'calm': {
                'name': 'برنامج التعلم العميق',
                'description': 'برنامج للتعلم العميق والتركيز',
                'daily_duration_minutes': 90,
                'session_duration_minutes': 60,
                'break_duration_minutes': 20,
                'focus_areas': ['deep_reading', 'problem_solving', 'analysis'],
                'difficulty_level': 'medium',
                'modules_count': 2,
            },
            'neutral': {
                'name': 'برنامج التعلم المتوازن',
                'description': 'برنامج متوازن يناسب حالتك الحالية',
                'daily_duration_minutes': 60,
                'session_duration_minutes': 30,
                'break_duration_minutes': 15,
                'focus_areas': ['balanced_mix', 'interactive', 'practice'],
                'difficulty_level': 'medium',
                'modules_count': 2,
            },
        }
    
    def generate_program(
        self,
        user_email: str,
        mood_history: List[Dict],
        available_modules: List[Dict],
        days: int = 7
    ) -> Dict:
        """
        Generate a personalized study program based on mood history
        
        Args:
            user_email: User's email
            mood_history: List of mood entries
            available_modules: List of available modules
            days: Number of days for the program
        
        Returns:
            Generated study program
        """
        # Analyze mood history
        mood_analysis = mood_tracking_service.analyze_mood_history(mood_history)
        
        # Determine dominant mood
        dominant_mood = mood_analysis.get('most_common_mood', 'neutral')
        recent_mood = mood_analysis.get('recent_mood', dominant_mood)
        
        # Use recent mood if available, otherwise use dominant
        current_mood = recent_mood if recent_mood else dominant_mood
        
        # Get template for current mood
        template = self.program_templates.get(current_mood, self.program_templates['neutral'])
        
        # Adjust based on trend
        if mood_analysis.get('trend') == 'improving':
            # Increase intensity slightly
            template = template.copy()
            template['daily_duration_minutes'] = int(template['daily_duration_minutes'] * 1.1)
            template['difficulty_level'] = 'medium' if template['difficulty_level'] == 'low' else template['difficulty_level']
        elif mood_analysis.get('trend') == 'declining':
            # Decrease intensity
            template = template.copy()
            template['daily_duration_minutes'] = int(template['daily_duration_minutes'] * 0.8)
            template['difficulty_level'] = 'low' if template['difficulty_level'] == 'high' else template['difficulty_level']
        
        # Select modules based on difficulty
        selected_modules = self._select_modules(
            available_modules,
            template['difficulty_level'],
            template['modules_count']
        )
        
        # Generate daily schedule
        daily_schedule = self._generate_daily_schedule(template, days)
        
        # Create program
        program = {
            'user_email': user_email,
            'mood_based': True,
            'dominant_mood': dominant_mood,
            'current_mood': current_mood,
            'mood_analysis': mood_analysis,
            'template': template,
            'selected_modules': selected_modules,
            'daily_schedule': daily_schedule,
            'total_days': days,
            'created_at': datetime.utcnow(),
            'recommendations': self._generate_recommendations(current_mood, mood_analysis),
        }
        
        return program
    
    def _select_modules(
        self,
        available_modules: List[Dict],
        difficulty_level: str,
        count: int
    ) -> List[Dict]:
        """Select modules based on difficulty level"""
        if not available_modules:
            return []
        
        # Sort modules by difficulty
        modules_with_difficulty = []
        for module in available_modules:
            difficulty = module.get('difficulty', 5)  # Default to medium (5)
            modules_with_difficulty.append((module, difficulty))
        
        # Filter and sort based on difficulty level
        if difficulty_level == 'high':
            # Select harder modules
            modules_with_difficulty.sort(key=lambda x: x[1], reverse=True)
            selected = modules_with_difficulty[:count]
        elif difficulty_level == 'low':
            # Select easier modules
            modules_with_difficulty.sort(key=lambda x: x[1])
            selected = modules_with_difficulty[:count]
        else:  # medium
            # Select modules closest to medium difficulty
            modules_with_difficulty.sort(key=lambda x: abs(x[1] - 5))
            selected = modules_with_difficulty[:count]
        
        return [module for module, _ in selected]
    
    def _generate_daily_schedule(self, template: Dict, days: int) -> List[Dict]:
        """Generate daily schedule for the program"""
        schedule = []
        
        for day in range(1, days + 1):
            date = datetime.utcnow() + timedelta(days=day)
            
            # Calculate number of sessions
            total_minutes = template['daily_duration_minutes']
            session_minutes = template['session_duration_minutes']
            break_minutes = template['break_duration_minutes']
            
            num_sessions = total_minutes // (session_minutes + break_minutes)
            
            sessions = []
            start_time = 9  # Start at 9 AM
            
            for session_num in range(num_sessions):
                sessions.append({
                    'session_number': session_num + 1,
                    'start_time': f"{start_time:02d}:00",
                    'duration_minutes': session_minutes,
                    'focus_area': template['focus_areas'][session_num % len(template['focus_areas'])],
                })
                start_time += (session_minutes + break_minutes) // 60
            
            schedule.append({
                'day': day,
                'date': date.isoformat(),
                'total_duration_minutes': total_minutes,
                'sessions': sessions,
            })
        
        return schedule
    
    def _generate_recommendations(self, mood: str, mood_analysis: Dict) -> List[str]:
        """Generate personalized recommendations based on mood"""
        recommendations = []
        
        if mood == 'positive':
            recommendations.extend([
                "استفد من طاقتك الإيجابية لتجربة مواد جديدة",
                "جرب تحديات صعبة - أنت في حالة ممتازة للتعلم",
                "ابدأ مشروعاً إبداعياً أو تطبيقاً عملياً",
            ])
        elif mood == 'negative':
            recommendations.extend([
                "ركز على مراجعة المواد المألوفة لتعزيز ثقتك",
                "خذ استراحات متكررة - لا ترهق نفسك",
                "جرب محتوى مرئي بدلاً من القراءة المكثفة",
            ])
        elif mood == 'calm':
            recommendations.extend([
                "مثالي للتعلم العميق والتركيز",
                "ركز على مواضيع معقدة تحتاج تفكير عميق",
                "اقرأ محتوى أكاديمي أو أوراق بحثية",
            ])
        else:  # neutral
            recommendations.extend([
                "جرب مزيجاً من المواد السهلة والصعبة",
                "استخدم محتوى تفاعلي مثل البطاقات التعليمية",
                "خطط لدراستك القادمة",
            ])
        
        # Add trend-based recommendations
        trend = mood_analysis.get('trend', 'stable')
        if trend == 'improving':
            recommendations.append("مزاجك يتحسن! استمر في ذلك 🎉")
        elif trend == 'declining':
            recommendations.append("لاحظنا انخفاضاً في مزاجك. قد تحتاج لاستراحة")
        
        return recommendations


# Global instance
mood_based_program_service = MoodBasedProgramService()


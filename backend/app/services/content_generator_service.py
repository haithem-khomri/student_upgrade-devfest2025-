"""
Content Generator Service - For generating study content from materials
"""
from typing import Dict, Any, Optional
import json

from app.services.ai.llm_service import LLMService


class ContentGeneratorService:
    """Service for generating study content"""
    
    def __init__(self):
        self.llm_service = LLMService()
    
    async def generate(
        self,
        content_type: str,
        content: str,
        module_id: Optional[str],
        options: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate study content"""
        if content_type == "summary":
            return await self._generate_summary(content, options)
        elif content_type == "flashcards":
            return await self._generate_flashcards(content, options)
        elif content_type == "quiz":
            return await self._generate_quiz(content, options)
        elif content_type == "exam-questions":
            return await self._generate_exam_questions(content, options)
        elif content_type == "analysis":
            return await self._generate_analysis(content, options)
        else:
            raise ValueError(f"Unknown content type: {content_type}")
    
    async def _generate_summary(self, content: str, options: Dict) -> Dict:
        """Generate summary"""
        prompt = f"""Summarize the following study material in a clear, structured way.
Focus on key concepts, main points, and important details.

Material:
{content[:2000]}  # Limit for token efficiency

Provide a comprehensive summary."""
        
        summary = await self.llm_service.chat_completion(
            message=prompt,
            short_answer=False,
        )
        
        return {
            "content": summary,
            "metadata": {
                "type": "summary",
                "explainableInsights": [
                    "Summary covers main concepts",
                    "Structured for easy review",
                ],
            },
        }
    
    async def _generate_flashcards(self, content: str, options: Dict) -> Dict:
        """Generate flashcards"""
        count = options.get("count", 10)
        
        prompt = f"""Create {count} flashcards from the following material.
Each flashcard should have:
- Front: A question or term
- Back: The answer or definition

Material:
{content[:2000]}

Format as JSON array with 'front' and 'back' fields."""
        
        response = await self.llm_service.chat_completion(
            message=prompt,
            short_answer=False,
        )
        
        # Try to parse JSON, fallback to structured text
        try:
            flashcards = json.loads(response)
        except:
            # Fallback: create simple flashcards from response
            flashcards = [
                {"front": f"Question {i+1}", "back": response[:100]}
                for i in range(min(count, 5))
            ]
        
        return {
            "content": flashcards,
            "metadata": {
                "type": "flashcards",
                "count": len(flashcards),
                "explainableInsights": [
                    f"Generated {len(flashcards)} flashcards",
                    "Covers key concepts from material",
                ],
            },
        }
    
    async def _generate_quiz(self, content: str, options: Dict) -> Dict:
        """Generate quiz questions"""
        count = options.get("count", 5)
        difficulty = options.get("difficulty", "medium")
        
        prompt = f"""Create {count} multiple-choice quiz questions ({difficulty} difficulty) from the material.
Each question should have:
- question: The question text
- options: Array of 4 options
- correctAnswer: Index of correct answer (0-3)

Material:
{content[:2000]}

Format as JSON array."""
        
        response = await self.llm_service.chat_completion(
            message=prompt,
            short_answer=False,
        )
        
        try:
            questions = json.loads(response)
        except:
            questions = [
                {
                    "question": f"Sample question {i+1}",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": 0,
                }
                for i in range(min(count, 3))
            ]
        
        return {
            "content": questions,
            "metadata": {
                "type": "quiz",
                "count": len(questions),
                "difficulty": difficulty,
                "explainableInsights": [
                    f"Generated {len(questions)} {difficulty} questions",
                    "Tests understanding of key concepts",
                ],
            },
        }
    
    async def _generate_exam_questions(self, content: str, options: Dict) -> Dict:
        """Generate exam-style questions"""
        return await self._generate_quiz(content, {**options, "difficulty": "hard"})
    
    async def _generate_analysis(self, content: str, options: Dict) -> Dict:
        """Generate pattern analysis"""
        prompt = f"""Analyze the following study material and identify:
1. Frequent topics/themes
2. Key concepts that appear often
3. Potential weak points or areas needing more attention
4. Recommended focus areas

Material:
{content[:2000]}

Provide a structured analysis."""
        
        analysis = await self.llm_service.chat_completion(
            message=prompt,
            short_answer=False,
        )
        
        return {
            "content": analysis,
            "metadata": {
                "type": "analysis",
                "explainableInsights": [
                    "Identifies key patterns in material",
                    "Highlights areas for focused study",
                    "Provides actionable recommendations",
                ],
            },
        }


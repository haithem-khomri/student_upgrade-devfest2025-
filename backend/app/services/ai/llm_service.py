"""
LLM Service - Provider-agnostic abstraction for LLM interactions

CONFIGURATION:
1. Set LLM_PROVIDER in .env (options: "openai", "anthropic", "google", "custom")
2. Add the appropriate API key

Supported Providers:
- OpenAI: Set OPENAI_API_KEY
- Anthropic: Set ANTHROPIC_API_KEY  
- Google Gemini: Set GOOGLE_API_KEY
- Custom: Set CUSTOM_LLM_API_URL and CUSTOM_LLM_API_KEY
"""
from typing import Dict, Optional, List, Any
import httpx
import json
from abc import ABC, abstractmethod

from app.core.config import settings


class BaseLLMProvider(ABC):
    """Base class for LLM providers"""
    
    @abstractmethod
    async def complete(
        self,
        message: str,
        system_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        pass


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT Provider"""
    
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        self.api_key = api_key
        self.model = model
    
    async def complete(
        self,
        message: str,
        system_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude Provider"""
    
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229"):
        self.api_key = api_key
        self.model = model
    
    async def complete(
        self,
        message: str,
        system_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "max_tokens": max_tokens,
                        "system": system_prompt,
                        "messages": [{"role": "user", "content": message}],
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["content"][0]["text"]
                else:
                    raise Exception(f"Anthropic API error: {response.status_code}")
        except Exception as e:
            raise Exception(f"Anthropic API error: {e}")


class GoogleGeminiProvider(BaseLLMProvider):
    """Google Gemini Provider - Using official SDK"""
    
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is required for Gemini provider")
        self.api_key = api_key
        self.model = model
        self._configured = False
    
    def _configure(self):
        """Configure the Gemini API"""
        if not self._configured:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._configured = True
            print(f"[Gemini] Configured with model: {self.model}")
    
    async def complete(
        self,
        message: str,
        system_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        try:
            import google.generativeai as genai
            import asyncio
            
            # Configure the API key
            self._configure()
            
            # Use the configured model (fallback to gemini-1.5-flash if invalid)
            model_name = self.model
            # Try to use the configured model, fallback to available models
            try:
                model = genai.GenerativeModel(
                    model_name,
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": temperature,
                    }
                )
            except Exception as model_error:
                print(f"[Gemini] Warning: Model {model_name} not available, trying gemini-1.5-flash")
                # Fallback to gemini-1.5-flash if the configured model doesn't exist
                model_name = "gemini-1.5-flash"
                model = genai.GenerativeModel(
                    model_name,
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": temperature,
                    }
                )
            
            # Combine system prompt and message
            full_prompt = f"{system_prompt}\n\nUser: {message}"
            
            print(f"[Gemini] Calling API with model: {model_name}, message length: {len(message)}")
            
            # Generate content in executor for async compatibility
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: model.generate_content(full_prompt)
            )
            
            if not response or not response.text:
                raise Exception("Empty response from Gemini API")
            
            print(f"[Gemini] Successfully received response (length: {len(response.text)})")
            return response.text
        except Exception as e:
            error_msg = f"Google Gemini API error: {str(e)}"
            print(f"[Gemini] Error: {error_msg}")
            raise Exception(error_msg)


class CustomLLMProvider(BaseLLMProvider):
    """
    Custom LLM Provider - Use this to integrate your own LLM API
    
    Configure:
    - CUSTOM_LLM_API_URL: Your API endpoint
    - CUSTOM_LLM_API_KEY: Your API key
    
    Expected API format (adjust _build_request and _parse_response as needed):
    POST to your endpoint with JSON body containing the message
    """
    
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key
    
    def _build_request(
        self,
        message: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> Dict[str, Any]:
        """
        Build the request body for your custom LLM API
        
        MODIFY THIS METHOD to match your API's expected format
        """
        return {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
    
    def _build_headers(self) -> Dict[str, str]:
        """
        Build request headers for your custom LLM API
        
        MODIFY THIS METHOD to match your API's authentication
        """
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
    
    def _parse_response(self, data: Dict[str, Any]) -> str:
        """
        Parse the response from your custom LLM API
        
        MODIFY THIS METHOD to extract the response text from your API's format
        """
        # Common formats - adjust based on your API
        if "choices" in data:
            # OpenAI-compatible format
            return data["choices"][0]["message"]["content"]
        elif "response" in data:
            return data["response"]
        elif "text" in data:
            return data["text"]
        elif "content" in data:
            if isinstance(data["content"], list):
                return data["content"][0]["text"]
            return data["content"]
        elif "message" in data:
            return data["message"]
        else:
            # Return the whole data as string if format is unknown
            return str(data)
    
    async def complete(
        self,
        message: str,
        system_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=self._build_headers(),
                    json=self._build_request(message, system_prompt, max_tokens, temperature),
                    timeout=60.0,  # Longer timeout for custom APIs
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_response(data)
                else:
                    raise Exception(f"Custom LLM API error: {response.status_code} - {response.text}")
        except Exception as e:
            raise Exception(f"Custom LLM API error: {e}")


class LLMService:
    """
    Main LLM Service - Provider-agnostic wrapper
    
    Usage:
        llm = LLMService()
        response = await llm.chat_completion("Hello!", context={}, language="ar")
    """
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self._llm_provider = self._get_provider()
    
    def _get_provider(self) -> Optional[BaseLLMProvider]:
        """Get the configured LLM provider"""
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            print(f"[LLMService] Initializing OpenAI provider with model: {getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo')}")
            return OpenAIProvider(
                api_key=settings.OPENAI_API_KEY,
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo'),
            )
        elif self.provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            print(f"[LLMService] Initializing Anthropic provider with model: {getattr(settings, 'ANTHROPIC_MODEL', 'claude-3-sonnet-20240229')}")
            return AnthropicProvider(
                api_key=settings.ANTHROPIC_API_KEY,
                model=getattr(settings, 'ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
            )
        elif self.provider == "google":
            google_api_key = getattr(settings, 'GOOGLE_API_KEY', None)
            if google_api_key:
                google_model = getattr(settings, 'GOOGLE_MODEL', 'gemini-1.5-flash')
                print(f"[LLMService] Initializing Google Gemini provider with model: {google_model}")
                try:
                    return GoogleGeminiProvider(
                        api_key=google_api_key,
                        model=google_model,
                    )
                except Exception as e:
                    print(f"[LLMService] Error initializing Gemini provider: {e}")
                    return None
            else:
                print("[LLMService] Warning: LLM_PROVIDER is 'google' but GOOGLE_API_KEY is not set")
                return None
        elif self.provider == "custom":
            custom_url = getattr(settings, 'CUSTOM_LLM_API_URL', None)
            custom_key = getattr(settings, 'CUSTOM_LLM_API_KEY', None)
            if custom_url and custom_key:
                print(f"[LLMService] Initializing Custom LLM provider with URL: {custom_url}")
                return CustomLLMProvider(api_url=custom_url, api_key=custom_key)
        
        print(f"[LLMService] No LLM provider configured (provider: {self.provider}), using fallback responses")
        return None
    
    async def chat_completion(
        self,
        message: str,
        context: Optional[Dict] = None,
        language: str = "ar",
        short_answer: bool = False,
    ) -> str:
        """
        Get chat completion from configured LLM
        
        Args:
            message: User message
            context: Additional context (user level, modules, etc.)
            language: Language code ('en', 'ar', 'fr')
            short_answer: Whether to return short answer (for mobile)
        """
        system_prompt = self._build_system_prompt(context, language, short_answer)
        max_tokens = 500 if short_answer else 1000
        
        if self._llm_provider:
            try:
                print(f"[LLMService] Calling {self.provider} provider for message: {message[:50]}...")
                response = await self._llm_provider.complete(
                    message=message,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=0.7,
                )
                print(f"[LLMService] Successfully received response from {self.provider} (length: {len(response)})")
                return response
            except Exception as e:
                print(f"[LLMService] Error calling {self.provider} provider: {e}")
                print(f"[LLMService] Falling back to predefined responses")
                return self._fallback_response(message, language)
        else:
            print(f"[LLMService] No provider configured, using fallback response")
            return self._fallback_response(message, language)
    
    def _build_system_prompt(
        self,
        context: Optional[Dict],
        language: str,
        short_answer: bool,
    ) -> str:
        """Build system prompt based on context"""
        if language == "ar":
            prompt = """أنت مساعد ذكي ومفيد لطلاب الجامعات. أنت متخصص في:
- الإجابة على أسئلة الطلاب حول الدراسة والجامعة
- تقديم نصائح للدراسة وتنظيم الوقت
- المساعدة في التحضير للامتحانات
- توجيه الطلاب وتقديم الإرشاد الأكاديمي

كن ودوداً ومتعاوناً. استخدم لغة عربية فصيحة وسهلة الفهم."""
        else:
            prompt = "You are a helpful AI assistant for university students. "
        
        if context:
            if context.get("user_level"):
                if language == "ar":
                    prompt += f"\nمستوى الطالب: {context['user_level']}. "
                else:
                    prompt += f"The student is at level {context['user_level']}. "
            if context.get("user_modules"):
                if language == "ar":
                    prompt += f"\nالمواد التي يدرسها: {', '.join(context['user_modules'])}. "
                else:
                    prompt += f"They are studying: {', '.join(context['user_modules'])}. "
        
        if short_answer:
            if language == "ar":
                prompt += "\nأعطِ إجابات مختصرة ومفيدة (2-3 جمل كحد أقصى)."
            else:
                prompt += "Keep your response brief and concise (2-3 sentences maximum). "
        
        return prompt
    
    def _fallback_response(self, message: str, language: str) -> str:
        """Smart fallback response when LLM is unavailable"""
        message_lower = message.strip().lower()
        
        # Keyword-based responses for Arabic
        if language == "ar":
            # Study tips
            if any(word in message for word in ['امتحان', 'اختبار', 'دراسة', 'مذاكرة', 'استعداد']):
                return """إليك نصائح للاستعداد للامتحانات:

📚 **التحضير المسبق:**
• ابدأ المراجعة قبل أسبوعين على الأقل
• قسّم المادة إلى أجزاء صغيرة
• راجع الملخصات والنقاط الأساسية

⏰ **تنظيم الوقت:**
• خصص 45 دقيقة للدراسة ثم 10 دقائق راحة
• ادرس المواد الصعبة في أوقات نشاطك
• لا تسهر ليلة الامتحان

💡 **نصائح إضافية:**
• حل امتحانات سابقة
• اشرح المادة لشخص آخر
• نم جيداً قبل الامتحان

بالتوفيق! 🌟"""
            
            # Time management
            elif any(word in message for word in ['وقت', 'تنظيم', 'جدول', 'إدارة']):
                return """إليك خطوات لتنظيم وقتك بفعالية:

📋 **التخطيط:**
• اكتب كل مهامك اليومية
• حدد الأولويات (مهم/عاجل)
• استخدم تطبيق تنظيم أو دفتر

⏱️ **تقنيات فعالة:**
• تقنية Pomodoro: 25 دقيقة عمل + 5 راحة
• خصص أوقات ثابتة للدراسة يومياً
• تجنب تعدد المهام

🎯 **نصائح:**
• ابدأ بالمهام الصعبة صباحاً
• خصص وقت للراحة والترفيه
• راجع جدولك أسبوعياً

النجاح يبدأ بالتنظيم! 💪"""
            
            # Focus and concentration
            elif any(word in message for word in ['تركيز', 'انتباه', 'تشتت', 'ملل']):
                return """إليك نصائح لتحسين تركيزك:

🎯 **البيئة المثالية:**
• اختر مكان هادئ ومرتب
• أبعد الهاتف أو فعّل وضع التركيز
• تأكد من إضاءة جيدة

🧠 **تقنيات التركيز:**
• ابدأ بـ 25 دقيقة فقط ثم زِد تدريجياً
• استخدم سماعات إلغاء الضوضاء
• اكتب الأفكار المشتتة وأجّلها

💧 **العناية بالجسم:**
• اشرب ماء كافي
• تناول وجبات خفيفة صحية
• خذ فترات راحة قصيرة

التركيز مهارة تتحسن بالممارسة! 🌟"""
            
            # Greeting
            elif any(word in message for word in ['مرحبا', 'السلام', 'أهلا', 'هلا', 'صباح', 'مساء']):
                return """مرحباً بك! 👋

أنا مساعدك الذكي للدراسة. يمكنني مساعدتك في:

📚 **الدراسة والامتحانات** - نصائح للتحضير والمراجعة
⏰ **تنظيم الوقت** - جداول وتقنيات فعالة  
🎯 **التركيز** - طرق لتحسين الانتباه
📖 **المواد الدراسية** - شرح ومساعدة

كيف يمكنني مساعدتك اليوم؟ 😊"""
            
            # Default Arabic response
            else:
                return f"""شكراً على سؤالك! 😊

سأحاول مساعدتك قدر الإمكان. سؤالك: "{message[:100]}..."

💡 **نصيحة سريعة:**
للحصول على أفضل إجابة، جرب أسئلة محددة مثل:
• كيف أستعد للامتحانات؟
• أريد نصائح للتركيز
• كيف أنظم وقتي؟

أنا هنا لمساعدتك! 🌟"""
        
        # English responses
        else:
            if any(word in message_lower for word in ['exam', 'test', 'study', 'prepare']):
                return """Here are some exam preparation tips:

📚 **Preparation:**
• Start reviewing at least 2 weeks early
• Break material into smaller chunks
• Focus on key concepts and summaries

⏰ **Time Management:**
• Study for 45 min, then take 10 min breaks
• Study difficult subjects during peak energy
• Don't pull all-nighters before exams

💡 **Extra Tips:**
• Practice with past exams
• Teach the material to someone else
• Get good sleep before the exam

Good luck! 🌟"""
            
            elif any(word in message_lower for word in ['time', 'schedule', 'organize', 'manage']):
                return """Here's how to manage your time effectively:

📋 **Planning:**
• Write down all your daily tasks
• Prioritize (important/urgent)
• Use a planner app or notebook

⏱️ **Effective Techniques:**
• Pomodoro: 25 min work + 5 min break
• Set fixed daily study times
• Avoid multitasking

🎯 **Tips:**
• Tackle hard tasks in the morning
• Schedule time for rest and fun
• Review your schedule weekly

Success starts with organization! 💪"""
            
            elif any(word in message_lower for word in ['focus', 'concentrate', 'distract', 'attention']):
                return """Here are tips to improve your focus:

🎯 **Ideal Environment:**
• Choose a quiet, tidy space
• Put your phone away or use focus mode
• Ensure good lighting

🧠 **Focus Techniques:**
• Start with just 25 minutes, then increase
• Use noise-canceling headphones
• Write down distracting thoughts for later

💧 **Self-Care:**
• Stay hydrated
• Eat healthy snacks
• Take short breaks

Focus is a skill that improves with practice! 🌟"""
            
            elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good evening']):
                return """Hello! 👋

I'm your AI study assistant. I can help you with:

📚 **Study & Exams** - Preparation and review tips
⏰ **Time Management** - Schedules and techniques
🎯 **Focus** - Ways to improve concentration
📖 **Coursework** - Explanations and guidance

How can I help you today? 😊"""
            
            else:
                return f"""Thanks for your question! 😊

I'll try to help you as best as I can. Your question: "{message[:100]}..."

💡 **Quick Tip:**
For the best answers, try specific questions like:
• How do I prepare for exams?
• I need tips for focusing
• How do I manage my time?

I'm here to help! 🌟"""


# Singleton instance
_llm_service: Optional[LLMService] = None

def get_llm_service() -> LLMService:
    """Get or create LLM service instance"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service

"""
Test script to verify Gemini API integration
Run this script to test if Gemini is properly configured and working
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.services.ai.llm_service import get_llm_service


async def test_gemini():
    """Test Gemini API integration"""
    print("=" * 60)
    print("Testing Gemini API Integration")
    print("=" * 60)
    print()
    
    # Check configuration
    print("1. Checking Configuration:")
    print(f"   LLM_PROVIDER: {settings.LLM_PROVIDER}")
    print(f"   GOOGLE_API_KEY: {'Set' if settings.GOOGLE_API_KEY else 'Not Set'}")
    if settings.GOOGLE_API_KEY:
        print(f"   GOOGLE_API_KEY (first 10 chars): {settings.GOOGLE_API_KEY[:10]}...")
    print(f"   GOOGLE_MODEL: {getattr(settings, 'GOOGLE_MODEL', 'gemini-1.5-flash')}")
    print()
    
    # Get LLM service
    print("2. Initializing LLM Service:")
    llm_service = get_llm_service()
    print(f"   Provider: {llm_service.provider}")
    print(f"   Has Provider Instance: {llm_service._llm_provider is not None}")
    print()
    
    if not llm_service._llm_provider:
        print("❌ ERROR: LLM provider is not configured!")
        print("   Please check:")
        print("   - LLM_PROVIDER is set to 'google'")
        print("   - GOOGLE_API_KEY is set correctly")
        return False
    
    # Test with a simple message
    print("3. Testing API Call:")
    test_message = "مرحبا، كيف حالك؟"
    print(f"   Test Message: {test_message}")
    print("   Calling Gemini API...")
    print()
    
    try:
        response = await llm_service.chat_completion(
            message=test_message,
            context=None,
            language="ar",
            short_answer=False,
        )
        
        print("✅ SUCCESS! Received response from Gemini:")
        print("-" * 60)
        print(response)
        print("-" * 60)
        print()
        print(f"Response length: {len(response)} characters")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: Failed to get response from Gemini")
        print(f"   Error: {str(e)}")
        print()
        print("   Please check:")
        print("   - API key is valid")
        print("   - Internet connection is working")
        print("   - Google Generative AI package is installed: pip install google-generativeai")
        return False


if __name__ == "__main__":
    # Load environment variables from .env if it exists
    from dotenv import load_dotenv
    load_dotenv()
    
    result = asyncio.run(test_gemini())
    sys.exit(0 if result else 1)


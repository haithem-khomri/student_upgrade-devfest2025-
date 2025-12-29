"""
Application configuration

LLM CONFIGURATION:
==================
Set LLM_PROVIDER to one of: "openai", "anthropic", "google", "custom"

Then set the corresponding API key:
- OpenAI: OPENAI_API_KEY
- Anthropic: ANTHROPIC_API_KEY
- Google Gemini: GOOGLE_API_KEY
- Custom: CUSTOM_LLM_API_URL and CUSTOM_LLM_API_KEY

Example .env file:
------------------
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Or for custom API:
LLM_PROVIDER=custom
CUSTOM_LLM_API_URL=https://your-api.com/v1/chat
CUSTOM_LLM_API_KEY=your-api-key
"""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Student Productivity Platform"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ]
    
    # Database
    DATABASE_URL: str = "sqlite:///./student_platform.db"  # SQLite for easy setup
    
    # ============================================
    # LLM Provider Configuration
    # ============================================
    LLM_PROVIDER: str = "none"  # Options: "openai", "anthropic", "google", "custom", "none"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"
    
    # Google Gemini
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_MODEL: str = "gemini-1.5-flash"
    
    # Custom LLM API (for your own API integration)
    CUSTOM_LLM_API_URL: Optional[str] = None
    CUSTOM_LLM_API_KEY: Optional[str] = None
    
    # ============================================
    # MongoDB Configuration
    # ============================================
    # Get your connection string from MongoDB Atlas or use local MongoDB
    # Example: mongodb+srv://username:password@cluster.mongodb.net/student_ai
    MONGODB_URL: Optional[str] = None
    MONGODB_DB_NAME: str = "student_ai"
    
    # ============================================
    # Vector Database & Embeddings
    # ============================================
    FAISS_INDEX_PATH: str = "./faiss_index"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Redis (for background tasks - optional)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env


settings = Settings()

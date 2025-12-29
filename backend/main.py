"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from app.routers import auth, chatbot, study_decision, resources, content_generator, commute, public_chat, recommendations, management, student_preferences, face_recognition, mood_recommendations, mood_tracking, mood_program
from app.core.config import settings
from app.core.database import engine
from app.core.mongodb import MongoDB
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    # SQLite/PostgreSQL (legacy - can be removed when fully migrated to MongoDB)
    Base.metadata.create_all(bind=engine)
    
    # MongoDB connection
    await MongoDB.connect()
    
    yield
    
    # Shutdown
    await MongoDB.disconnect()


app = FastAPI(
    title="AI Student Productivity Platform API",
    description="Backend API for AI-powered student productivity platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
# Public routes (no auth required)
app.include_router(public_chat.router, prefix="/api/chat", tags=["Public Chat"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])

# Protected routes (auth required)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["Chatbot"])
app.include_router(study_decision.router, prefix="/api/v1/study-decision", tags=["Study Decision"])
app.include_router(resources.router, prefix="/api/v1/resources", tags=["Resources"])
app.include_router(content_generator.router, prefix="/api/v1/content-generator", tags=["Content Generator"])
app.include_router(commute.router, prefix="/api/v1/commute", tags=["Commute"])

# Student preferences and scores management
app.include_router(student_preferences.router, prefix="/api/v1/student", tags=["Student Management"])

# Face recognition routes
app.include_router(face_recognition.router, prefix="/api/v1/face", tags=["Face Recognition"])

# Mood-based recommendations
app.include_router(mood_recommendations.router, prefix="/api/v1/mood", tags=["Mood Recommendations"])

# Mood tracking
app.include_router(mood_tracking.router, prefix="/api/v1/mood", tags=["Mood Tracking"])

# Mood-based study programs
app.include_router(mood_program.router, prefix="/api/v1/mood", tags=["Mood-Based Programs"])

# Management routes (CRUD operations)
app.include_router(management.router, prefix="/api/management", tags=["Management"])


@app.get("/")
async def root():
    return {"message": "AI Student Productivity Platform API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Try to actually ping MongoDB to verify connection
    mongodb_status = "disconnected"
    db_name = None
    
    try:
        if MongoDB.client is not None and MongoDB.db is not None:
            # Actually ping the database
            await MongoDB.client.admin.command('ping')
            mongodb_status = "connected"
            db_name = MongoDB.db.name
    except Exception:
        mongodb_status = "disconnected"
    
    # Check LLM provider status
    from app.services.ai.llm_service import get_llm_service
    llm_service = get_llm_service()
    llm_provider = llm_service.provider
    llm_configured = llm_service._llm_provider is not None
    
    llm_status = {
        "provider": llm_provider,
        "configured": llm_configured,
        "api_key_set": False
    }
    
    if llm_provider == "google":
        llm_status["api_key_set"] = bool(settings.GOOGLE_API_KEY)
        if llm_configured:
            llm_status["model"] = getattr(settings, 'GOOGLE_MODEL', 'gemini-1.5-flash')
    elif llm_provider == "openai":
        llm_status["api_key_set"] = bool(settings.OPENAI_API_KEY)
    elif llm_provider == "anthropic":
        llm_status["api_key_set"] = bool(settings.ANTHROPIC_API_KEY)
    
    return {
        "status": "healthy",
        "mongodb": mongodb_status,
        "database": db_name,
        "llm": llm_status
    }


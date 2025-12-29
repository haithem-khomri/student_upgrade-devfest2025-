"""
Database initialization script
Creates tables if they don't exist
"""
from app.core.database import engine, Base
from app.models import User, ChatMessage, Resource, ResourceRating, Module, GeneratedContent

def init_db():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    init_db()


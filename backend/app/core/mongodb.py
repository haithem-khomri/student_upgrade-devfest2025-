"""
MongoDB Configuration and Connection

SETUP:
1. Create a MongoDB Atlas account or use local MongoDB
2. Get your connection string
3. Set MONGODB_URL in your .env file

Example .env:
    MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/student_ai?retryWrites=true&w=majority

For local MongoDB:
    MONGODB_URL=mongodb://localhost:27017/student_ai
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import os

from app.core.config import settings


class MongoDB:
    """MongoDB connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        if cls.client is None:
            # Try multiple sources for MongoDB URL
            mongodb_url = (
                os.getenv('MONGODB_URL') or 
                getattr(settings, 'MONGODB_URL', None) or
                None
            )
            
            if not mongodb_url:
                print("[WARN] MONGODB_URL not configured. Chat messages will not be saved.")
                print("[INFO] Set MONGODB_URL environment variable to enable MongoDB.")
                print("[INFO] You can set it via:")
                print("[INFO]   1. Environment variable: $env:MONGODB_URL = '...'")
                print("[INFO]   2. .env file in backend directory")
                print("[INFO]   3. Using start_server.ps1 script")
                cls.client = None
                cls.db = None
                return
            
            try:
                print(f"[INFO] Connecting to MongoDB...")
                # Show connection info (hide password)
                url_display = mongodb_url.split('@')[1] if '@' in mongodb_url else mongodb_url.split('//')[1] if '//' in mongodb_url else 'hidden'
                print(f"[INFO] MongoDB URL: {url_display}")
                
                # Extract database name from URL if present
                db_name_from_url = None
                if '/' in mongodb_url:
                    # Extract db name from URL (after last / and before ?)
                    url_parts = mongodb_url.split('/')
                    if len(url_parts) > 3:
                        db_part = url_parts[-1].split('?')[0]
                        if db_part and db_part not in ['', '?']:
                            db_name_from_url = db_part
                
                # Increase timeout for initial connection
                # MongoDB Atlas requires TLS/SSL by default
                # The connection string should already include tls=true
                cls.client = AsyncIOMotorClient(
                    mongodb_url, 
                    serverSelectionTimeoutMS=30000,  # 30 seconds
                    connectTimeoutMS=30000,
                    socketTimeoutMS=30000,
                    # Don't explicitly set tls - let the connection string handle it
                )
                
                # Get database name from URL, env var, or use default
                db_name = (
                    db_name_from_url or
                    os.getenv('MONGODB_DB_NAME') or 
                    getattr(settings, 'MONGODB_DB_NAME', None) or
                    'student_ai'
                )
                cls.db = cls.client[db_name]
                
                # Test connection with timeout
                print(f"[INFO] Testing connection to database: {db_name}...")
                await cls.client.admin.command('ping')
                print(f"[OK] ✅ Connected to MongoDB successfully!")
                print(f"[OK] Database: {db_name}")
                
                # Verify we can access the database
                collections = await cls.db.list_collection_names()
                print(f"[OK] Available collections: {len(collections)}")
                
                # Create indexes
                await cls._create_indexes()
                
            except Exception as e:
                print(f"[ERROR] ❌ MongoDB connection failed!")
                print(f"[ERROR] Error type: {type(e).__name__}")
                print(f"[ERROR] Error message: {str(e)}")
                print(f"[ERROR] Please check:")
                print(f"[ERROR]   1. MONGODB_URL environment variable is set correctly")
                print(f"[ERROR]   2. MongoDB server is accessible")
                print(f"[ERROR]   3. Network connection is stable")
                print(f"[ERROR]   4. Credentials are correct")
                import traceback
                print(f"[ERROR] Full traceback:")
                print(traceback.format_exc())
                cls.client = None
                cls.db = None
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB"""
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None
            print("[INFO] Disconnected from MongoDB")
    
    @classmethod
    async def _create_indexes(cls):
        """Create database indexes for better performance"""
        if cls.db is None:
            return
        
        try:
            # Users collection indexes
            await cls.db.users.create_index("email", unique=True)
            
            # Chat messages indexes
            await cls.db.chat_messages.create_index("user_id")
            await cls.db.chat_messages.create_index("created_at")
            await cls.db.chat_messages.create_index([("user_id", 1), ("created_at", -1)])
            
            # Resources indexes
            await cls.db.resources.create_index("module_id")
            await cls.db.resources.create_index("type")
            
            # Modules indexes
            await cls.db.modules.create_index("user_id")
            
            print("[OK] MongoDB indexes created")
        except Exception as e:
            print(f"[WARN] Index creation warning: {e}")
    
    @classmethod
    def get_db(cls) -> Optional[AsyncIOMotorDatabase]:
        """Get database instance"""
        return cls.db
    
    @classmethod
    def is_connected(cls) -> bool:
        """Check if connected to MongoDB (synchronous check)"""
        try:
            # Simple check: client and db must exist
            if cls.client is None or cls.db is None:
                return False
            # Return True if both exist (async check_connection will verify it's actually working)
            return True
        except Exception:
            return False
    
    @classmethod
    async def check_connection(cls) -> bool:
        """Async check if MongoDB is actually connected and responsive"""
        try:
            if cls.client is None or cls.db is None:
                return False
            # Actually ping the database
            await cls.client.admin.command('ping')
            return True
        except Exception:
            return False


# Collections helper
class Collections:
    """Helper class for accessing collections"""
    
    @staticmethod
    def users():
        return MongoDB.db["users"] if MongoDB.db is not None else None
    
    @staticmethod
    def chat_messages():
        return MongoDB.db["chat_messages"] if MongoDB.db is not None else None
    
    @staticmethod
    def resources():
        return MongoDB.db["resources"] if MongoDB.db is not None else None
    
    @staticmethod
    def modules():
        return MongoDB.db["modules"] if MongoDB.db is not None else None
    
    @staticmethod
    def generated_content():
        return MongoDB.db["generated_content"] if MongoDB.db is not None else None
    
    @staticmethod
    def resource_ratings():
        return MongoDB.db["resource_ratings"] if MongoDB.db is not None else None


# Dependency for FastAPI
async def get_mongodb() -> Optional[AsyncIOMotorDatabase]:
    """FastAPI dependency to get MongoDB database"""
    return MongoDB.get_db()


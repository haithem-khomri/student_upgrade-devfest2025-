"""Test MongoDB connection"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_connection():
    """Test MongoDB connection"""
    mongodb_url = os.getenv('MONGODB_URL')
    
    if not mongodb_url:
        print("[ERROR] MONGODB_URL not found in environment variables")
        print("\nPlease set MONGODB_URL in:")
        print("  1. .env file in backend directory")
        print("  2. Or use start_server.ps1 script")
        return False
    
    print("[OK] MONGODB_URL found")
    print(f"   URL: {mongodb_url.split('@')[1] if '@' in mongodb_url else 'hidden'}")
    
    try:
        print("\n[INFO] Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient(
            mongodb_url,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        
        # Test connection
        await client.admin.command('ping')
        print("[OK] Successfully connected to MongoDB!")
        
        # Get database name
        db_name = os.getenv('MONGODB_DB_NAME', 'student_ai')
        db = client[db_name]
        
        # List collections
        collections = await db.list_collection_names()
        print(f"[OK] Database '{db_name}' accessible")
        print(f"   Collections: {len(collections)}")
        if collections:
            print(f"   {', '.join(collections[:5])}{'...' if len(collections) > 5 else ''}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"[ERROR] Connection failed!")
        print(f"   Error: {type(e).__name__}: {str(e)}")
        print("\n[TIP] Troubleshooting:")
        print("  1. Check your internet connection")
        print("  2. Verify MongoDB Atlas IP whitelist (should allow all IPs: 0.0.0.0/0)")
        print("  3. Check if credentials are correct")
        print("  4. Verify connection string format")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())


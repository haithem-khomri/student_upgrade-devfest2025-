"""
Seed Demo User Data - Add modules and data for demo@student.ai

Usage:
    python seed_demo_user.py
"""
import asyncio
import os
from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_demo_user():
    """Seed demo user with sample data"""
    
    mongodb_url = os.getenv('MONGODB_URL')
    db_name = os.getenv('MONGODB_DB_NAME', 'student_ai')
    
    if not mongodb_url:
        print("[ERROR] MONGODB_URL not found in environment")
        return
    
    print("[INFO] Connecting to MongoDB...")
    
    try:
        client = AsyncIOMotorClient(mongodb_url)
        db = client[db_name]
        await client.admin.command('ping')
        print(f"[OK] Connected to MongoDB: {db_name}")
    except Exception as e:
        print(f"[ERROR] Failed to connect: {e}")
        return
    
    demo_email = "demo@student.ai"
    
    # Check if demo user exists
    user = await db.users.find_one({"email": demo_email})
    
    if not user:
        print(f"[INFO] Creating demo user: {demo_email}")
        # Create demo user
        user = {
            "email": demo_email,
            "hashed_password": hash_password("demo123"),
            "name": "طالب تجريبي",
            "level": "L1",
            "speciality_id": "spec_1",
            "semester": 1,
            "enrolled_modules": [],
            "progress": {},
            "scores": {},
            "scores_avg": {},
            "preferences": {
                "language": "ar",
                "theme": "dark",
                "notifications": True,
                "preferred_study_time": "evening",
                "difficulty_preference": "medium"
            },
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(user)
        print("[OK] Demo user created")
    else:
        print(f"[INFO] Demo user already exists: {demo_email}")
    
    # Get available modules
    modules = await db.modules.find({}).to_list(length=100)
    
    if not modules:
        print("[WARN] No modules found in database!")
        print("[INFO] Run 'python seed_modules.py' first to add modules")
        client.close()
        return
    
    print(f"[INFO] Found {len(modules)} modules in database")
    
    # Select some modules for demo user (first 5 modules)
    selected_modules = [m["id"] for m in modules[:5]]
    
    # Update user with enrolled modules
    await db.users.update_one(
        {"email": demo_email},
        {
            "$set": {
                "enrolled_modules": selected_modules,
                "speciality_id": modules[0].get("speciality_id", "spec_1"),
                "level": modules[0].get("year", "L1"),
            }
        }
    )
    
    print(f"[OK] Added {len(selected_modules)} modules to demo user")
    
    # Add some sample progress
    progress = {}
    for i, module_id in enumerate(selected_modules):
        progress[module_id] = {
            "courses_completed": (i + 1) * 2,
            "tds_completed": i + 1,
            "overall_progress": min(30 + (i * 15), 100)
        }
    
    await db.users.update_one(
        {"email": demo_email},
        {"$set": {"progress": progress}}
    )
    
    print("[OK] Added sample progress data")
    
    # Add some sample scores
    scores = {}
    scores_avg = {}
    for i, module_id in enumerate(selected_modules[:3]):  # Add scores for first 3 modules
        module_scores = [
            {
                "score": 14.5 + (i * 0.5),
                "exam_type": "midterm",
                "notes": "امتحان جزئي جيد",
                "date": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "score": 16.0 + (i * 0.3),
                "exam_type": "td",
                "notes": "TD ممتاز",
                "date": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        scores[module_id] = module_scores
        scores_avg[module_id] = sum(s["score"] for s in module_scores) / len(module_scores)
    
    await db.users.update_one(
        {"email": demo_email},
        {
            "$set": {
                "scores": scores,
                "scores_avg": scores_avg
            }
        }
    )
    
    print("[OK] Added sample scores")
    
    # Verify
    updated_user = await db.users.find_one({"email": demo_email})
    
    print("\n" + "="*60)
    print("DEMO USER DATA SUMMARY")
    print("="*60)
    print(f"Email: {updated_user['email']}")
    print(f"Name: {updated_user['name']}")
    print(f"Level: {updated_user.get('level', 'N/A')}")
    print(f"Enrolled Modules: {len(updated_user.get('enrolled_modules', []))}")
    print(f"Modules with Progress: {len(updated_user.get('progress', {}))}")
    print(f"Modules with Scores: {len(updated_user.get('scores', {}))}")
    print("="*60)
    
    print("\n[OK] Demo user seeding complete!")
    print(f"\nLogin credentials:")
    print(f"  Email: {demo_email}")
    print(f"  Password: demo123")
    
    client.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("DEMO USER SEEDER")
    print("="*60 + "\n")
    asyncio.run(seed_demo_user())


"""
Module Seeding Script - Quick seed for modules only

Usage:
    python seed_modules.py
"""
import asyncio
import os
from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def seed_modules():
    """Seed modules with sample data"""
    
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
    
    # Sample modules data
    modules = [
        {
            "id": "mod_1",
            "name": "البرمجة الشيئية",
            "name_fr": "Programmation Orientée Objet",
            "code": "POO",
            "speciality_id": "spec_1",
            "year": "L1",
            "semester": 1,
            "credits": 4,
            "coefficient": 3,
            "difficulty": 7,
            "description": "مقدمة في البرمجة الشيئية باستخدام Java",
            "created_at": datetime.utcnow()
        },
        {
            "id": "mod_2",
            "name": "هياكل البيانات والخوارزميات",
            "name_fr": "Structures de Données et Algorithmes",
            "code": "SDA",
            "speciality_id": "spec_1",
            "year": "L1",
            "semester": 1,
            "credits": 5,
            "coefficient": 4,
            "difficulty": 8,
            "description": "دراسة هياكل البيانات الأساسية والخوارزميات",
            "created_at": datetime.utcnow()
        },
        {
            "id": "mod_3",
            "name": "قواعد البيانات",
            "name_fr": "Bases de Données",
            "code": "BD",
            "speciality_id": "spec_1",
            "year": "L2",
            "semester": 1,
            "credits": 4,
            "coefficient": 3,
            "difficulty": 6,
            "description": "مقدمة في قواعد البيانات العلائقية و SQL",
            "created_at": datetime.utcnow()
        },
        {
            "id": "mod_4",
            "name": "الذكاء الاصطناعي",
            "name_fr": "Intelligence Artificielle",
            "code": "IA",
            "speciality_id": "spec_1",
            "year": "M1",
            "semester": 1,
            "credits": 6,
            "coefficient": 4,
            "difficulty": 9,
            "description": "مقدمة في الذكاء الاصطناعي والتعلم الآلي",
            "created_at": datetime.utcnow()
        },
        {
            "id": "mod_5",
            "name": "الرياضيات المتقطعة",
            "name_fr": "Mathématiques Discrètes",
            "code": "MD",
            "speciality_id": "spec_1",
            "year": "L1",
            "semester": 1,
            "credits": 3,
            "coefficient": 2,
            "difficulty": 7,
            "description": "الرياضيات المتقطعة وتطبيقاتها في علوم الحاسوب",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Check if modules already exist
    existing_count = await db.modules.count_documents({})
    if existing_count > 0:
        print(f"[INFO] Found {existing_count} existing modules")
        response = input("Do you want to clear existing modules? (y/n): ")
        if response.lower() == 'y':
            await db.modules.delete_many({})
            print("[OK] Cleared existing modules")
        else:
            print("[INFO] Keeping existing modules, adding new ones...")
            # Only add modules that don't exist
            existing_ids = {doc["id"] async for doc in db.modules.find({}, {"id": 1})}
            modules = [m for m in modules if m["id"] not in existing_ids]
    
    if modules:
        await db.modules.insert_many(modules)
        print(f"[OK] Inserted {len(modules)} modules")
    else:
        print("[INFO] No new modules to insert")
    
    # Create indexes
    await db.modules.create_index("speciality_id")
    await db.modules.create_index([("speciality_id", 1), ("year", 1)])
    await db.modules.create_index("code")
    
    print("\n[OK] Module seeding complete!")
    print(f"Total modules in database: {await db.modules.count_documents({})}")
    
    client.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("MODULE SEEDER")
    print("="*60 + "\n")
    asyncio.run(seed_modules())


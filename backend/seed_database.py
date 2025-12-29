"""
Database Seeding Script - Complete Version

Seeds MongoDB with:
- University info
- Specialities with years
- Modules organized by speciality and year
- Courses (cours) for each module
- TDs (Travaux Dirigés) with exercises
- Exams with questions
- Students with different specialities and levels
- Resources

Usage:
    python seed_database.py
"""
import asyncio
import json
import os
from datetime import datetime, timedelta
import random
from pathlib import Path

# Add parent directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def seed_database():
    """Main seeding function"""
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    mongodb_url = os.getenv('MONGODB_URL')
    db_name = os.getenv('MONGODB_DB_NAME', 'student_ai')
    
    if not mongodb_url:
        print("[ERROR] MONGODB_URL not found in environment")
        print("Set MONGODB_URL environment variable and try again")
        return
    
    print(f"[INFO] Connecting to MongoDB...")
    
    try:
        client = AsyncIOMotorClient(mongodb_url)
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print(f"[OK] Connected to MongoDB: {db_name}")
        
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        return
    
    # Load seed data
    data_path = Path(__file__).parent / "data" / "seed_data.json"
    
    if not data_path.exists():
        print(f"[ERROR] Seed data file not found: {data_path}")
        return
    
    with open(data_path, 'r', encoding='utf-8') as f:
        seed_data = json.load(f)
    
    print("[INFO] Loaded seed data")
    
    # Clear existing data
    print("[INFO] Clearing existing data...")
    collections_to_clear = [
        'users', 'modules', 'resources', 'specialities', 
        'university_info', 'courses', 'tds', 'exams', 'chat_messages'
    ]
    for coll in collections_to_clear:
        await db[coll].delete_many({})
    
    # 1. Seed university info
    print("[INFO] Seeding university info...")
    await db.university_info.insert_one({
        **seed_data["university"],
        "created_at": datetime.utcnow()
    })
    
    # 2. Seed specialities
    print("[INFO] Seeding specialities...")
    specialities = []
    for spec in seed_data["specialities"]:
        specialities.append({
            **spec,
            "created_at": datetime.utcnow()
        })
    if specialities:
        await db.specialities.insert_many(specialities)
    print(f"[OK] Inserted {len(specialities)} specialities")
    
    # 3. Seed modules
    print("[INFO] Seeding modules...")
    modules = []
    for module in seed_data["modules"]:
        # Add random exam date in the future
        exam_date = datetime.utcnow() + timedelta(days=random.randint(30, 120))
        modules.append({
            **module,
            "exam_date": exam_date,
            "created_at": datetime.utcnow()
        })
    if modules:
        await db.modules.insert_many(modules)
    print(f"[OK] Inserted {len(modules)} modules")
    
    # 4. Seed courses
    print("[INFO] Seeding courses...")
    courses = []
    for course in seed_data.get("courses", []):
        courses.append({
            **course,
            "created_at": datetime.utcnow()
        })
    if courses:
        await db.courses.insert_many(courses)
    print(f"[OK] Inserted {len(courses)} courses")
    
    # 5. Seed TDs
    print("[INFO] Seeding TDs...")
    tds = []
    for td in seed_data.get("tds", []):
        tds.append({
            **td,
            "created_at": datetime.utcnow()
        })
    if tds:
        await db.tds.insert_many(tds)
    print(f"[OK] Inserted {len(tds)} TDs")
    
    # 6. Seed exams
    print("[INFO] Seeding exams...")
    exams = []
    for exam in seed_data.get("exams", []):
        # Convert date string to datetime
        exam_copy = {**exam}
        if "date" in exam_copy and isinstance(exam_copy["date"], str):
            exam_copy["date"] = datetime.strptime(exam_copy["date"], "%Y-%m-%d")
        exam_copy["created_at"] = datetime.utcnow()
        exams.append(exam_copy)
    if exams:
        await db.exams.insert_many(exams)
    print(f"[OK] Inserted {len(exams)} exams")
    
    # 7. Seed users
    print("[INFO] Seeding users...")
    users = []
    for user in seed_data["users"]:
        users.append({
            "email": user["email"],
            "hashed_password": hash_password(user["password"]),
            "name": user["name"],
            "level": user["level"],
            "speciality_id": user.get("speciality_id"),
            "semester": user.get("semester", 1),
            "enrolled_modules": user.get("enrolled_modules", []),
            "progress": user.get("progress", {}),
            "preferences": {
                "language": "ar",
                "theme": "dark",
                "notifications": True
            },
            "is_active": True,
            "created_at": datetime.utcnow()
        })
    if users:
        await db.users.insert_many(users)
    print(f"[OK] Inserted {len(users)} users")
    
    # 8. Seed resources (from resources_data.json)
    print("[INFO] Seeding resources...")
    resources_path = Path(__file__).parent / "data" / "resources_data.json"
    
    resources = []
    if resources_path.exists():
        with open(resources_path, 'r', encoding='utf-8') as f:
            resources_data = json.load(f)
        
        for resource in resources_data.get("resources", []):
            resources.append({
                **resource,
                "created_at": datetime.utcnow()
            })
    else:
        # Fallback to seed_data resources
        for resource in seed_data.get("resources", []):
            resources.append({
                **resource,
                "average_rating": round(random.uniform(3.5, 5.0), 1),
                "rating_count": random.randint(5, 50),
                "created_at": datetime.utcnow()
            })
    
    if resources:
        await db.resources.insert_many(resources)
    print(f"[OK] Inserted {len(resources)} resources")
    
    # 9. Create user_ratings collection index
    await db.user_ratings.create_index([("user_id", 1), ("resource_id", 1)], unique=True)
    await db.user_ratings.create_index("resource_id")
    print("[OK] User ratings indexes created")
    
    # Create indexes
    print("[INFO] Creating indexes...")
    await db.users.create_index("email", unique=True)
    await db.modules.create_index("speciality_id")
    await db.modules.create_index([("speciality_id", 1), ("year", 1)])
    await db.modules.create_index("code")
    await db.courses.create_index("module_id")
    await db.tds.create_index("module_id")
    await db.exams.create_index("module_id")
    await db.resources.create_index("module_id")
    print("[OK] Indexes created")
    
    # Print summary
    print("\n" + "="*60)
    print("DATABASE SEEDING COMPLETE!")
    print("="*60)
    print(f"  - University info: 1")
    print(f"  - Specialities: {len(specialities)}")
    print(f"  - Modules: {len(modules)}")
    print(f"  - Courses: {len(courses)}")
    print(f"  - TDs: {len(tds)}")
    print(f"  - Exams: {len(exams)}")
    print(f"  - Users: {len(users)}")
    print(f"  - Resources: {len(resources)}")
    print("="*60)
    
    # Print student details
    print("\n" + "="*60)
    print("TEST ACCOUNTS:")
    print("="*60)
    for user in seed_data["users"]:
        print(f"\n  Name: {user['name']}")
        print(f"  Email: {user['email']}")
        print(f"  Password: {user['password']}")
        print(f"  Level: {user['level']}")
        print(f"  Speciality: {user.get('speciality_id', 'N/A')}")
        print(f"  Enrolled Modules: {', '.join(user.get('enrolled_modules', []))}")
        print("-" * 40)
    
    # Print modules by speciality
    print("\n" + "="*60)
    print("MODULES BY SPECIALITY:")
    print("="*60)
    for spec in seed_data["specialities"]:
        print(f"\n  [{spec['code']}] {spec['name']}")
        spec_modules = [m for m in seed_data["modules"] if m.get("speciality_id") == spec["id"]]
        for year in spec.get("years", []):
            year_modules = [m for m in spec_modules if m.get("year") == year]
            if year_modules:
                print(f"    {year}:")
                for m in year_modules:
                    print(f"      - [{m['code']}] {m['name']} (S{m['semester']})")
    
    # Close connection
    client.close()
    print("\n[OK] Database connection closed")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("STUDENT AI - DATABASE SEEDER (Complete Version)")
    print("="*60 + "\n")
    
    asyncio.run(seed_database())

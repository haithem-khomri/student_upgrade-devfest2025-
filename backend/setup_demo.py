"""
Complete Demo Setup - Seed modules and demo user data

This script:
1. Seeds modules if they don't exist
2. Creates/updates demo user with enrolled modules
3. Adds sample progress and scores

Usage:
    python setup_demo.py
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

async def setup_demo():
    """Complete demo setup"""
    
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
    
    # Step 1: Check/Create modules
    print("\n[STEP 1] Checking modules...")
    modules_count = await db.modules.count_documents({})
    
    if modules_count == 0:
        print("[INFO] No modules found, creating sample modules...")
        sample_modules = [
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
        await db.modules.insert_many(sample_modules)
        print(f"[OK] Created {len(sample_modules)} modules")
    else:
        print(f"[OK] Found {modules_count} existing modules")
    
    # Step 2: Create/Update demo user
    print("\n[STEP 2] Setting up demo user...")
    demo_email = "demo@student.ai"
    
    # Get all modules
    all_modules = await db.modules.find({}).to_list(length=100)
    module_ids = [m["id"] for m in all_modules[:5]]  # First 5 modules
    
    user = await db.users.find_one({"email": demo_email})
    
    if not user:
        print("[INFO] Creating demo user...")
        user = {
            "email": demo_email,
            "hashed_password": hash_password("demo123"),
            "name": "طالب تجريبي",
            "level": "L1",
            "speciality_id": all_modules[0].get("speciality_id", "spec_1") if all_modules else "spec_1",
            "semester": 1,
            "enrolled_modules": module_ids,
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
        print("[INFO] Demo user exists, updating...")
        await db.users.update_one(
            {"email": demo_email},
            {
                "$set": {
                    "enrolled_modules": module_ids,
                    "speciality_id": all_modules[0].get("speciality_id", "spec_1") if all_modules else user.get("speciality_id", "spec_1"),
                    "level": all_modules[0].get("year", "L1") if all_modules else user.get("level", "L1"),
                }
            }
        )
        print("[OK] Demo user updated")
    
    # Step 3: Add progress
    print("\n[STEP 3] Adding progress data...")
    progress = {}
    # More realistic progress distribution
    progress_patterns = [
        {"courses": 6, "tds": 4, "overall": 75},   # mod_1: 75% complete
        {"courses": 5, "tds": 3, "overall": 60},   # mod_2: 60% complete
        {"courses": 7, "tds": 4, "overall": 80},   # mod_3: 80% complete
        {"courses": 3, "tds": 2, "overall": 40},   # mod_4: 40% complete (harder)
        {"courses": 5, "tds": 3, "overall": 65},   # mod_5: 65% complete
    ]
    
    for i, module_id in enumerate(module_ids):
        if i < len(progress_patterns):
            pattern = progress_patterns[i]
            progress[module_id] = {
                "courses_completed": pattern["courses"],
                "tds_completed": pattern["tds"],
                "overall_progress": pattern["overall"]
            }
        else:
            progress[module_id] = {
                "courses_completed": 4,
                "tds_completed": 2,
                "overall_progress": 50
            }
    
    await db.users.update_one(
        {"email": demo_email},
        {"$set": {"progress": progress}}
    )
    print(f"[OK] Added progress for {len(progress)} modules")
    
    # Step 4: Add courses, TDs, exams, and resources to modules
    print("\n[STEP 4] Adding courses, TDs, exams, and resources to modules...")
    
    module_data = {
        "mod_1": {  # البرمجة الشيئية
            "courses": [
                {
                    "id": "c1", 
                    "title": "مقدمة في البرمجة الشيئية", 
                    "chapter": 1, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Object-Oriented Programming (OOP) in 7 minutes", "url": "https://www.youtube.com/watch?v=pTB0EiLXUC8"},
                        {"title": "Learn Object Oriented Programming in 5 Minutes", "url": "https://www.youtube.com/watch?v=SiBw7os-_zI"},
                        {"title": "Object-Oriented Programming Explained", "url": "https://www.youtube.com/watch?v=lbXsrHGhBAU"}
                    ]
                },
                {
                    "id": "c2", 
                    "title": "الكلاسات والكائنات", 
                    "chapter": 2, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Java Classes and Objects Tutorial", "url": "https://www.youtube.com/watch?v=a199KZGMNxk"},
                        {"title": "Classes and Objects in Java", "url": "https://www.youtube.com/watch?v=5nRkVEgK2GE"},
                        {"title": "Java OOP - Classes and Objects", "url": "https://www.youtube.com/watch?v=5dRfMc5b8XA"}
                    ]
                },
                {
                    "id": "c3", 
                    "title": "الوراثة (Inheritance)", 
                    "chapter": 3, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Java Inheritance Explained", "url": "https://www.youtube.com/watch?v=IShHDXs6n08"},
                        {"title": "Inheritance in Java Tutorial", "url": "https://www.youtube.com/watch?v=zMpSuy03b7s"},
                        {"title": "Java Inheritance - Full Tutorial", "url": "https://www.youtube.com/watch?v=9JpNY-XAseg"}
                    ]
                },
                {
                    "id": "c4", 
                    "title": "التعددية الشكلية (Polymorphism)", 
                    "chapter": 4, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Polymorphism in Java Tutorial", "url": "https://www.youtube.com/watch?v=Ft88V_rDO4I"},
                        {"title": "Java Polymorphism Explained", "url": "https://www.youtube.com/watch?v=0xw06loTm1k"},
                        {"title": "Polymorphism in Object-Oriented Programming", "url": "https://www.youtube.com/watch?v=J9A0a5sZ9iI"}
                    ]
                },
                {
                    "id": "c5", 
                    "title": "التغليف (Encapsulation)", 
                    "chapter": 5, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Encapsulation in Java Tutorial", "url": "https://www.youtube.com/watch?v=6VJ5CXF7og4"},
                        {"title": "Java Encapsulation Explained", "url": "https://www.youtube.com/watch?v=7k5SUsrWGvM"},
                        {"title": "Encapsulation - Object-Oriented Programming", "url": "https://www.youtube.com/watch?v=3Zfu7U2tIbc"}
                    ]
                },
                {
                    "id": "c6", 
                    "title": "الواجهات (Interfaces)", 
                    "chapter": 6, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Java Interfaces Tutorial", "url": "https://www.youtube.com/watch?v=UumX4mQKQlA"},
                        {"title": "Java Interface Explained", "url": "https://www.youtube.com/watch?v=GC1h8B1h1B8"},
                        {"title": "Interfaces in Java - Full Tutorial", "url": "https://www.youtube.com/watch?v=1OpAgZvYXLQ"}
                    ]
                },
                {
                    "id": "c7", 
                    "title": "الكلاسات المجردة (Abstract Classes)", 
                    "chapter": 7, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Abstract Classes in Java Tutorial", "url": "https://www.youtube.com/watch?v=HvPlEJ3LHgE"},
                        {"title": "Java Abstract Classes Explained", "url": "https://www.youtube.com/watch?v=3VqflX8_M6M"},
                        {"title": "Abstract Classes vs Interfaces", "url": "https://www.youtube.com/watch?v=HvPlEJ3LHgE"}
                    ]
                },
                {
                    "id": "c8", 
                    "title": "معالجة الاستثناءات (Exception Handling)", 
                    "chapter": 8, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Java Exception Handling Tutorial", "url": "https://www.youtube.com/watch?v=K_-3OLkXkzY"},
                        {"title": "Exception Handling in Java", "url": "https://www.youtube.com/watch?v=KJx8m9ZG6GM"},
                        {"title": "Java Exceptions - Learn Exception Handling", "url": "https://www.youtube.com/watch?v=KJx8m9ZG6GM"}
                    ]
                },
            ],
            "tds": [
                {"id": "td1", "title": "TD 1: أساسيات البرمجة الشيئية", "number": 1, "exercises_count": 5},
                {"id": "td2", "title": "TD 2: الكلاسات والكائنات", "number": 2, "exercises_count": 6},
                {"id": "td3", "title": "TD 3: الوراثة", "number": 3, "exercises_count": 5},
                {"id": "td4", "title": "TD 4: التعددية الشكلية", "number": 4, "exercises_count": 4},
                {"id": "td5", "title": "TD 5: الواجهات والكلاسات المجردة", "number": 5, "exercises_count": 6},
                {"id": "td6", "title": "TD 6: معالجة الاستثناءات", "number": 6, "exercises_count": 5},
            ],
            "exams": [
                {"id": "e1", "title": "امتحان جزئي", "type": "midterm", "duration_minutes": 90, "total_points": 20},
                {"id": "e2", "title": "امتحان نهائي", "type": "final", "duration_minutes": 120, "total_points": 20},
            ],
            "resources": [
                {"id": "r1", "title": "مقدمة في Java OOP", "type": "video", "url": "https://www.youtube.com/watch?v=example1"},
                {"id": "r2", "title": "دليل البرمجة الشيئية", "type": "pdf", "url": "https://example.com/oop-guide.pdf"},
            ]
        },
        "mod_2": {  # هياكل البيانات والخوارزميات
            "courses": [
                {
                    "id": "c1", 
                    "title": "مقدمة في هياكل البيانات", 
                    "chapter": 1, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Data Structures and Algorithms for Beginners", "url": "https://www.youtube.com/watch?v=8hly31xKli0"},
                        {"title": "Introduction to Data Structures", "url": "https://www.youtube.com/watch?v=DuDz6B4cqVc"},
                        {"title": "Data Structures Explained", "url": "https://www.youtube.com/watch?v=RBSGKlAvoiM"}
                    ]
                },
                {
                    "id": "c2", 
                    "title": "المصفوفات والقوائم", 
                    "chapter": 2, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Arrays and Lists in Data Structures", "url": "https://www.youtube.com/watch?v=QJNwK2uJyGs"},
                        {"title": "Array Data Structure Tutorial", "url": "https://www.youtube.com/watch?v=QJNwK2uJyGs"},
                        {"title": "Linked Lists for Beginners", "url": "https://www.youtube.com/watch?v=WwfhLC16bis"}
                    ]
                },
                {
                    "id": "c3", 
                    "title": "المكدسات والطوابير", 
                    "chapter": 3, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Stack Data Structure Tutorial", "url": "https://www.youtube.com/watch?v=KcT3aVgrrpU"},
                        {"title": "Queue Data Structure Explained", "url": "https://www.youtube.com/watch?v=XuCbpw6Bj1U"},
                        {"title": "Stacks and Queues Tutorial", "url": "https://www.youtube.com/watch?v=wjI1WNcIntg"}
                    ]
                },
                {
                    "id": "c4", 
                    "title": "الأشجار (Trees)", 
                    "chapter": 4, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Tree Data Structure Tutorial", "url": "https://www.youtube.com/watch?v=1-l_UOFi1Xw"},
                        {"title": "Trees in Data Structures", "url": "https://www.youtube.com/watch?v=1-l_UOFi1Xw"},
                        {"title": "Tree Data Structure Explained", "url": "https://www.youtube.com/watch?v=qH6yxkw0u78"}
                    ]
                },
                {
                    "id": "c5", 
                    "title": "الأشجار الثنائية (Binary Trees)", 
                    "chapter": 5, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Binary Trees Tutorial", "url": "https://www.youtube.com/watch?v=H5JubkIy_p8"},
                        {"title": "Binary Tree Data Structure", "url": "https://www.youtube.com/watch?v=H5JubkIy_p8"},
                        {"title": "Binary Search Trees Explained", "url": "https://www.youtube.com/watch?v=zIX3zQP0khM"}
                    ]
                },
                {
                    "id": "c6", 
                    "title": "الرسوم البيانية (Graphs)", 
                    "chapter": 6, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Graph Data Structure Tutorial", "url": "https://www.youtube.com/watch?v=DBRW8nwZV-g"},
                        {"title": "Graphs in Data Structures", "url": "https://www.youtube.com/watch?v=DBRW8nwZV-g"},
                        {"title": "Graph Algorithms for Beginners", "url": "https://www.youtube.com/watch?v=tWVWeAqZ0WU"}
                    ]
                },
                {
                    "id": "c7", 
                    "title": "خوارزميات البحث", 
                    "chapter": 7, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Searching Algorithms Tutorial", "url": "https://www.youtube.com/watch?v=6ysjqCUv3K4"},
                        {"title": "Binary Search Algorithm Explained", "url": "https://www.youtube.com/watch?v=P3YID7liFed"},
                        {"title": "Linear Search vs Binary Search", "url": "https://www.youtube.com/watch?v=6ysjqCUv3K4"}
                    ]
                },
                {
                    "id": "c8", 
                    "title": "خوارزميات الترتيب", 
                    "chapter": 8, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Sorting Algorithms Explained", "url": "https://www.youtube.com/watch?v=4CykZVqBuCw"},
                        {"title": "15 Sorting Algorithms in 6 Minutes", "url": "https://www.youtube.com/watch?v=kPRA0W1kECg"},
                        {"title": "Quick Sort Algorithm Tutorial", "url": "https://www.youtube.com/watch?v=Hoixgm4-P4M"}
                    ]
                },
            ],
            "tds": [
                {"id": "td1", "title": "TD 1: المصفوفات والقوائم", "number": 1, "exercises_count": 6},
                {"id": "td2", "title": "TD 2: المكدسات والطوابير", "number": 2, "exercises_count": 5},
                {"id": "td3", "title": "TD 3: الأشجار", "number": 3, "exercises_count": 6},
                {"id": "td4", "title": "TD 4: الرسوم البيانية", "number": 4, "exercises_count": 5},
                {"id": "td5", "title": "TD 5: خوارزميات البحث", "number": 5, "exercises_count": 4},
                {"id": "td6", "title": "TD 6: خوارزميات الترتيب", "number": 6, "exercises_count": 6},
            ],
            "exams": [
                {"id": "e1", "title": "امتحان جزئي", "type": "midterm", "duration_minutes": 90, "total_points": 20},
                {"id": "e2", "title": "امتحان نهائي", "type": "final", "duration_minutes": 120, "total_points": 20},
            ],
            "resources": [
                {"id": "r1", "title": "مقدمة في هياكل البيانات", "type": "video", "url": "https://www.youtube.com/watch?v=example2"},
                {"id": "r2", "title": "خوارزميات الترتيب والبحث", "type": "pdf", "url": "https://example.com/algorithms.pdf"},
            ]
        },
        "mod_3": {  # قواعد البيانات
            "courses": [
                {
                    "id": "c1", 
                    "title": "مقدمة في قواعد البيانات", 
                    "chapter": 1, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Database Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc"},
                        {"title": "Introduction to Databases", "url": "https://www.youtube.com/watch?v=FR4QIeZaPeM"},
                        {"title": "What is a Database?", "url": "https://www.youtube.com/watch?v=wR0jg0eQsZA"}
                    ]
                },
                {
                    "id": "c2", 
                    "title": "النموذج العلائقي", 
                    "chapter": 2, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Relational Database Concepts", "url": "https://www.youtube.com/watch?v=NvrpuBAMddw"},
                        {"title": "Relational Database Design", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc"},
                        {"title": "Relational Model Explained", "url": "https://www.youtube.com/watch?v=wR0jg0eQsZA"}
                    ]
                },
                {
                    "id": "c3", 
                    "title": "SQL الأساسي", 
                    "chapter": 3, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "SQL Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY"},
                        {"title": "Learn SQL in 1 Hour", "url": "https://www.youtube.com/watch?v=7S_tz1z_5bA"},
                        {"title": "SQL Basics Tutorial", "url": "https://www.youtube.com/watch?v=kbKty5ZVK4s"}
                    ]
                },
                {
                    "id": "c4", 
                    "title": "SQL المتقدم", 
                    "chapter": 4, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Advanced SQL Tutorial", "url": "https://www.youtube.com/watch?v=7mz73uXD9DA"},
                        {"title": "Advanced SQL Queries", "url": "https://www.youtube.com/watch?v=7mz73uXD9DA"},
                        {"title": "SQL Joins Explained", "url": "https://www.youtube.com/watch?v=2HVMiPPuWIg"}
                    ]
                },
                {
                    "id": "c5", 
                    "title": "التطبيع (Normalization)", 
                    "chapter": 5, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Database Normalization Explained", "url": "https://www.youtube.com/watch?v=GFQaEYEc8_8"},
                        {"title": "Normalization in Database Design", "url": "https://www.youtube.com/watch?v=GFQaEYEc8_8"},
                        {"title": "Database Normal Forms Tutorial", "url": "https://www.youtube.com/watch?v=J-drts33N8g"}
                    ]
                },
                {
                    "id": "c6", 
                    "title": "الفهارس والأداء", 
                    "chapter": 6, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Database Indexing Explained", "url": "https://www.youtube.com/watch?v=fsG1XaZEa78"},
                        {"title": "SQL Indexes Tutorial", "url": "https://www.youtube.com/watch?v=fsG1XaZEa78"},
                        {"title": "Database Performance Optimization", "url": "https://www.youtube.com/watch?v=H4g1zYzZTSE"}
                    ]
                },
                {
                    "id": "c7", 
                    "title": "المعاملات (Transactions)", 
                    "chapter": 7, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Database Transactions Explained", "url": "https://www.youtube.com/watch?v=e6Yd8zYvjqI"},
                        {"title": "SQL Transactions Tutorial", "url": "https://www.youtube.com/watch?v=e6Yd8zYvjqI"},
                        {"title": "ACID Properties in Databases", "url": "https://www.youtube.com/watch?v=ya1dS1eT2cM"}
                    ]
                },
                {
                    "id": "c8", 
                    "title": "الأمان في قواعد البيانات", 
                    "chapter": 8, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Database Security Tutorial", "url": "https://www.youtube.com/watch?v=4n0vdNPXosI"},
                        {"title": "SQL Injection Prevention", "url": "https://www.youtube.com/watch?v=ciNHn38EyRc"},
                        {"title": "Database Security Best Practices", "url": "https://www.youtube.com/watch?v=4n0vdNPXosI"}
                    ]
                },
            ],
            "tds": [
                {"id": "td1", "title": "TD 1: النموذج العلائقي", "number": 1, "exercises_count": 5},
                {"id": "td2", "title": "TD 2: SQL الأساسي", "number": 2, "exercises_count": 6},
                {"id": "td3", "title": "TD 3: SQL المتقدم", "number": 3, "exercises_count": 6},
                {"id": "td4", "title": "TD 4: التطبيع", "number": 4, "exercises_count": 5},
                {"id": "td5", "title": "TD 5: المعاملات", "number": 5, "exercises_count": 4},
            ],
            "exams": [
                {"id": "e1", "title": "امتحان جزئي", "type": "midterm", "duration_minutes": 90, "total_points": 20},
                {"id": "e2", "title": "امتحان نهائي", "type": "final", "duration_minutes": 120, "total_points": 20},
            ],
            "resources": [
                {"id": "r1", "title": "تعلم SQL من الصفر", "type": "video", "url": "https://www.youtube.com/watch?v=example3"},
                {"id": "r2", "title": "دليل قواعد البيانات", "type": "pdf", "url": "https://example.com/database-guide.pdf"},
            ]
        },
        "mod_4": {  # الذكاء الاصطناعي
            "courses": [
                {
                    "id": "c1", 
                    "title": "مقدمة في الذكاء الاصطناعي", 
                    "chapter": 1, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "What is Artificial Intelligence?", "url": "https://www.youtube.com/watch?v=JMUxmLyrhSk"},
                        {"title": "AI Explained in 5 Minutes", "url": "https://www.youtube.com/watch?v=ad79nYk2keg"},
                        {"title": "Introduction to Artificial Intelligence", "url": "https://www.youtube.com/watch?v=JMuUxmLyrhSk"}
                    ]
                },
                {
                    "id": "c2", 
                    "title": "البحث والاستكشاف", 
                    "chapter": 2, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Search Algorithms in AI", "url": "https://www.youtube.com/watch?v=RN3C5y7a8hM"},
                        {"title": "BFS and DFS Algorithms Explained", "url": "https://www.youtube.com/watch?v=pcKY4hjDrxk"},
                        {"title": "A* Search Algorithm Tutorial", "url": "https://www.youtube.com/watch?v=ySN5Wnu88nE"}
                    ]
                },
                {
                    "id": "c3", 
                    "title": "التعلم الآلي الأساسي", 
                    "chapter": 3, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Machine Learning for Beginners", "url": "https://www.youtube.com/watch?v=aircAruvnKk"},
                        {"title": "Machine Learning Explained", "url": "https://www.youtube.com/watch?v=9f-GarcDY58"},
                        {"title": "Introduction to Machine Learning", "url": "https://www.youtube.com/watch?v=aircAruvnKk"}
                    ]
                },
                {
                    "id": "c4", 
                    "title": "الشبكات العصبية", 
                    "chapter": 4, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Neural Networks Explained", "url": "https://www.youtube.com/watch?v=aircAruvnKk"},
                        {"title": "Neural Network Tutorial", "url": "https://www.youtube.com/watch?v=Ilg3gGewQ5U"},
                        {"title": "How Neural Networks Work", "url": "https://www.youtube.com/watch?v=aircAruvnKk"}
                    ]
                },
                {
                    "id": "c5", 
                    "title": "التعلم العميق", 
                    "chapter": 5, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Deep Learning Explained", "url": "https://www.youtube.com/watch?v=6M5VXKLf4D4"},
                        {"title": "Deep Learning Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=VyWAvY2CF9c"},
                        {"title": "What is Deep Learning?", "url": "https://www.youtube.com/watch?v=6M5VXKLf4D4"}
                    ]
                },
                {
                    "id": "c6", 
                    "title": "معالجة اللغة الطبيعية", 
                    "chapter": 6, 
                    "duration_hours": 3,
                    "youtube_videos": [
                        {"title": "Natural Language Processing Explained", "url": "https://www.youtube.com/watch?v=CMrHM8a3hqw"},
                        {"title": "NLP Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=CMrHM8a3hqw"},
                        {"title": "Introduction to NLP", "url": "https://www.youtube.com/watch?v=5ctbvkAMQO4"}
                    ]
                },
            ],
            "tds": [
                {"id": "td1", "title": "TD 1: البحث والاستكشاف", "number": 1, "exercises_count": 5},
                {"id": "td2", "title": "TD 2: التعلم الآلي", "number": 2, "exercises_count": 6},
                {"id": "td3", "title": "TD 3: الشبكات العصبية", "number": 3, "exercises_count": 5},
                {"id": "td4", "title": "TD 4: التعلم العميق", "number": 4, "exercises_count": 6},
            ],
            "exams": [
                {"id": "e1", "title": "امتحان جزئي", "type": "midterm", "duration_minutes": 90, "total_points": 20},
                {"id": "e2", "title": "امتحان نهائي", "type": "final", "duration_minutes": 120, "total_points": 20},
            ],
            "resources": [
                {"id": "r1", "title": "مقدمة في الذكاء الاصطناعي", "type": "video", "url": "https://www.youtube.com/watch?v=example4"},
                {"id": "r2", "title": "دليل التعلم الآلي", "type": "pdf", "url": "https://example.com/ml-guide.pdf"},
            ]
        },
        "mod_5": {  # الرياضيات المتقطعة
            "courses": [
                {
                    "id": "c1", 
                    "title": "مقدمة في الرياضيات المتقطعة", 
                    "chapter": 1, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Discrete Mathematics for Beginners", "url": "https://www.youtube.com/watch?v=rdXw7Ps9vxc"},
                        {"title": "Introduction to Discrete Mathematics", "url": "https://www.youtube.com/watch?v=rdXw7Ps9vxc"},
                        {"title": "Discrete Math Full Course", "url": "https://www.youtube.com/watch?v=rdXw7Ps9vxc"}
                    ]
                },
                {
                    "id": "c2", 
                    "title": "المنطق الرياضي", 
                    "chapter": 2, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Mathematical Logic Tutorial", "url": "https://www.youtube.com/watch?v=QN_kdT7d62k"},
                        {"title": "Propositional Logic Explained", "url": "https://www.youtube.com/watch?v=QN_kdT7d62k"},
                        {"title": "Logic in Discrete Mathematics", "url": "https://www.youtube.com/watch?v=QN_kdT7d62k"}
                    ]
                },
                {
                    "id": "c3", 
                    "title": "نظرية المجموعات", 
                    "chapter": 3, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Set Theory Tutorial", "url": "https://www.youtube.com/watch?v=tyDKR4FG3Yw"},
                        {"title": "Sets in Discrete Mathematics", "url": "https://www.youtube.com/watch?v=tyDKR4FG3Yw"},
                        {"title": "Set Theory Explained", "url": "https://www.youtube.com/watch?v=tyDKR4FG3Yw"}
                    ]
                },
                {
                    "id": "c4", 
                    "title": "العلاقات والدوال", 
                    "chapter": 4, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Relations and Functions Tutorial", "url": "https://www.youtube.com/watch?v=UZLN9hGAf8Q"},
                        {"title": "Functions in Discrete Mathematics", "url": "https://www.youtube.com/watch?v=UZLN9hGAf8Q"},
                        {"title": "Relations in Discrete Math", "url": "https://www.youtube.com/watch?v=UZLN9hGAf8Q"}
                    ]
                },
                {
                    "id": "c5", 
                    "title": "نظرية الأعداد", 
                    "chapter": 5, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Number Theory Tutorial", "url": "https://www.youtube.com/watch?v=19SW3P_PRHQ"},
                        {"title": "Number Theory for Beginners", "url": "https://www.youtube.com/watch?v=19SW3P_PRHQ"},
                        {"title": "Number Theory Explained", "url": "https://www.youtube.com/watch?v=19SW3P_PRHQ"}
                    ]
                },
                {
                    "id": "c6", 
                    "title": "التركيبات (Combinatorics)", 
                    "chapter": 6, 
                    "duration_hours": 2,
                    "youtube_videos": [
                        {"title": "Combinatorics Tutorial", "url": "https://www.youtube.com/watch?v=u_4lz5QqY-s"},
                        {"title": "Permutations and Combinations", "url": "https://www.youtube.com/watch?v=u_4lz5QqY-s"},
                        {"title": "Combinatorics Explained", "url": "https://www.youtube.com/watch?v=u_4lz5QqY-s"}
                    ]
                },
            ],
            "tds": [
                {"id": "td1", "title": "TD 1: المنطق الرياضي", "number": 1, "exercises_count": 5},
                {"id": "td2", "title": "TD 2: نظرية المجموعات", "number": 2, "exercises_count": 5},
                {"id": "td3", "title": "TD 3: العلاقات والدوال", "number": 3, "exercises_count": 5},
                {"id": "td4", "title": "TD 4: نظرية الأعداد", "number": 4, "exercises_count": 4},
            ],
            "exams": [
                {"id": "e1", "title": "امتحان جزئي", "type": "midterm", "duration_minutes": 90, "total_points": 20},
                {"id": "e2", "title": "امتحان نهائي", "type": "final", "duration_minutes": 120, "total_points": 20},
            ],
            "resources": [
                {"id": "r1", "title": "مقدمة في الرياضيات المتقطعة", "type": "video", "url": "https://www.youtube.com/watch?v=example5"},
                {"id": "r2", "title": "دليل الرياضيات المتقطعة", "type": "pdf", "url": "https://example.com/discrete-math.pdf"},
            ]
        }
    }
    
    # Update modules with courses, TDs, exams, and resources
    for module_id, data in module_data.items():
        await db.modules.update_one(
            {"id": module_id},
            {
                "$set": {
                    "courses": data["courses"],
                    "tds": data["tds"],
                    "exams": data["exams"],
                    "resources": data["resources"]
                }
            }
        )
    print(f"[OK] Updated {len(module_data)} modules with courses, TDs, exams, and resources")
    
    # Step 5: Add scores
    print("\n[STEP 5] Adding sample scores...")
    scores = {}
    scores_avg = {}
    # More realistic scores with variation
    score_patterns = [
        [15.5, 16.0, 14.0],  # mod_1: good scores
        [13.0, 15.5, 14.5],  # mod_2: average scores
        [16.5, 17.0, 15.0],  # mod_3: excellent scores
        [12.0, 13.5, 11.5],  # mod_4: challenging module
        [14.5, 15.0, 13.5],  # mod_5: good scores
    ]
    
    for i, module_id in enumerate(module_ids):
        if i < len(score_patterns):
            pattern = score_patterns[i]
            module_scores = [
                {
                    "score": round(pattern[0], 2),
                    "exam_type": "midterm",
                    "notes": "امتحان جزئي",
                    "date": (datetime.utcnow().replace(day=15)).isoformat(),
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "score": round(pattern[1], 2),
                    "exam_type": "td",
                    "notes": "TD",
                    "date": (datetime.utcnow().replace(day=20)).isoformat(),
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "score": round(pattern[2], 2),
                    "exam_type": "quiz",
                    "notes": "اختبار قصير",
                    "date": (datetime.utcnow().replace(day=25)).isoformat(),
                    "created_at": datetime.utcnow().isoformat()
                }
            ]
            scores[module_id] = module_scores
            scores_avg[module_id] = round(sum(s["score"] for s in module_scores) / len(module_scores), 2)
    
    await db.users.update_one(
        {"email": demo_email},
        {
            "$set": {
                "scores": scores,
                "scores_avg": scores_avg
            }
        }
    )
    print(f"[OK] Added scores for {len(scores)} modules")
    
    # Step 6: Create speciality if doesn't exist
    print("\n[STEP 6] Checking speciality...")
    spec = await db.specialities.find_one({"id": "spec_1"})
    if not spec:
        await db.specialities.insert_one({
            "id": "spec_1",
            "name": "علوم الحاسوب",
            "name_fr": "Informatique",
            "code": "CS",
            "level": "licence",
            "years": ["L1", "L2", "L3"],
            "description": "تخصص علوم الحاسوب",
            "created_at": datetime.utcnow()
        })
        print("[OK] Created speciality")
    else:
        print("[OK] Speciality exists")
    
    # Verify
    updated_user = await db.users.find_one({"email": demo_email})
    
    print("\n" + "="*60)
    print("DEMO SETUP COMPLETE!")
    print("="*60)
    print(f"Email: {updated_user['email']}")
    print(f"Name: {updated_user['name']}")
    print(f"Level: {updated_user.get('level', 'N/A')}")
    print(f"Speciality: {updated_user.get('speciality_id', 'N/A')}")
    print(f"Enrolled Modules: {len(updated_user.get('enrolled_modules', []))}")
    print(f"  - {', '.join(updated_user.get('enrolled_modules', [])[:5])}")
    print(f"Modules with Progress: {len(updated_user.get('progress', {}))}")
    print(f"Modules with Scores: {len(updated_user.get('scores', {}))}")
    
    # Show detailed progress
    print("\n📊 Progress Details:")
    for module_id, prog in updated_user.get('progress', {}).items():
        module = await db.modules.find_one({"id": module_id})
        if module:
            print(f"  - {module.get('name', module_id)}: {prog.get('overall_progress', 0)}%")
    
    # Show detailed scores
    print("\n📈 Scores Details:")
    for module_id, avg_score in updated_user.get('scores_avg', {}).items():
        module = await db.modules.find_one({"id": module_id})
        if module:
            print(f"  - {module.get('name', module_id)}: {avg_score}/20")
    
    print("="*60)
    
    print("\n✅ Demo user is ready!")
    print(f"\nLogin with:")
    print(f"  Email: {demo_email}")
    print(f"  Password: demo123")
    
    client.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("DEMO SETUP - Complete Demo User Configuration")
    print("="*60 + "\n")
    asyncio.run(setup_demo())


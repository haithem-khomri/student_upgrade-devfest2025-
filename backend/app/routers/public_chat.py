"""
Public Chat Router - For landing page quick questions (no authentication required)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

from app.services.ai.llm_service import get_llm_service
from app.services.chat_service import ChatService

router = APIRouter()


class PublicChatRequest(BaseModel):
    """Request model for public chat"""
    message: str
    language: str = "ar"
    session_id: Optional[str] = None  # For tracking conversation


class PublicChatResponse(BaseModel):
    """Response model for public chat"""
    message: str
    success: bool = True
    session_id: Optional[str] = None  # Return session ID for conversation tracking


@router.post("", response_model=PublicChatResponse)
async def public_chat(request: PublicChatRequest):
    """
    Public chat endpoint for quick questions on landing page
    
    No authentication required - suitable for quick questions before signup
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Limit message length for public endpoint
    if len(request.message) > 500:
        raise HTTPException(status_code=400, detail="Message too long (max 500 characters)")
    
    # Generate or use session ID for conversation tracking
    session_id = request.session_id or str(uuid.uuid4())
    
    try:
        # Save user message to MongoDB (optional - won't fail if not connected)
        await ChatService.save_message(
            role="user",
            content=request.message,
            session_id=session_id,
            language=request.language,
        )
        
        # Get AI response
        llm_service = get_llm_service()
        
        response_text = await llm_service.chat_completion(
            message=request.message,
            context=None,  # No user context for public chat
            language=request.language,
            short_answer=True,  # Keep responses concise for quick questions
        )
        
        # Save assistant response to MongoDB
        await ChatService.save_message(
            role="assistant",
            content=response_text,
            session_id=session_id,
            language=request.language,
        )
        
        return PublicChatResponse(
            message=response_text,
            success=True,
            session_id=session_id,
        )
    except Exception as e:
        print(f"Public chat error: {e}")
        # Return a friendly error message
        if request.language == "ar":
            return PublicChatResponse(
                message="عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
                success=False,
                session_id=session_id,
            )
        else:
            return PublicChatResponse(
                message="Sorry, an error occurred. Please try again.",
                success=False,
                session_id=session_id,
            )


@router.get("/health")
async def chat_health():
    """Health check for chat service"""
    from app.core.mongodb import MongoDB
    
    llm_service = get_llm_service()
    has_provider = llm_service._llm_provider is not None
    
    return {
        "status": "healthy",
        "llm_configured": has_provider,
        "provider": llm_service.provider if has_provider else "fallback",
        "mongodb_connected": MongoDB.is_connected(),
    }


@router.get("/db-stats")
async def get_db_stats():
    """Get database statistics - for testing purposes"""
    from app.core.mongodb import MongoDB
    
    if not MongoDB.is_connected():
        return {
            "connected": False,
            "message": "MongoDB not connected"
        }
    
    try:
        db = MongoDB.get_db()
        
        # Get counts from each collection
        stats = {
            "users": await db.users.count_documents({}),
            "specialities": await db.specialities.count_documents({}),
            "modules": await db.modules.count_documents({}),
            "courses": await db.courses.count_documents({}),
            "tds": await db.tds.count_documents({}),
            "exams": await db.exams.count_documents({}),
            "resources": await db.resources.count_documents({}),
            "chat_messages": await db.chat_messages.count_documents({})
        }
        
        return {
            "connected": True,
            "database": MongoDB.db.name,
            "stats": stats
        }
    except Exception as e:
        return {
            "connected": True,
            "error": str(e)
        }


@router.get("/specialities")
async def get_all_specialities():
    """Get all specialities with their modules organized by year"""
    from app.core.mongodb import MongoDB
    
    if not MongoDB.is_connected():
        return {"error": "MongoDB not connected"}
    
    try:
        db = MongoDB.get_db()
        
        specialities = []
        async for spec in db.specialities.find({}):
            spec_data = {
                "id": spec.get("id"),
                "name": spec.get("name"),
                "name_fr": spec.get("name_fr"),
                "code": spec.get("code"),
                "level": spec.get("level"),
                "years": spec.get("years", []),
                "description": spec.get("description"),
                "modules_by_year": {}
            }
            
            # Get modules for this speciality organized by year
            for year in spec.get("years", []):
                modules = []
                async for module in db.modules.find({
                    "speciality_id": spec.get("id"),
                    "year": year
                }).sort("semester", 1):
                    modules.append({
                        "id": module.get("id"),
                        "name": module.get("name"),
                        "code": module.get("code"),
                        "semester": module.get("semester"),
                        "credits": module.get("credits"),
                        "coefficient": module.get("coefficient"),
                        "difficulty": module.get("difficulty")
                    })
                spec_data["modules_by_year"][year] = modules
            
            specialities.append(spec_data)
        
        return {
            "specialities": specialities,
            "total": len(specialities)
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/module/{module_id}/details")
async def get_module_full_details(module_id: str):
    """Get full module details including courses, TDs, and exams"""
    from app.core.mongodb import MongoDB
    
    # Check if MongoDB is actually connected
    is_connected = await MongoDB.check_connection()
    
    # If MongoDB not connected, return mock data
    if not is_connected:
        # Return mock module details based on module_id
        mock_modules = {
            "mod_1": {
                "module": {
                    "id": "mod_1",
                    "name": "البرمجة الشيئية",
                    "name_fr": "Programmation Orientée Objet",
                    "code": "POO",
                    "year": "L1",
                    "semester": 1,
                    "credits": 4,
                    "coefficient": 3,
                    "difficulty": 7,
                    "description": "مقدمة في البرمجة الشيئية باستخدام Java"
                },
                "courses": [
                    {
                        "id": "c1",
                        "title": "مقدمة في البرمجة الشيئية",
                        "chapter": 1,
                        "content": "في هذا الدرس سنتعرف على مفاهيم البرمجة الشيئية الأساسية: الكلاسات، الكائنات، الوراثة، والتغليف.",
                        "duration_hours": 2,
                        "order": 1
                    },
                    {
                        "id": "c2",
                        "title": "الكلاسات والكائنات",
                        "chapter": 2,
                        "content": "سنتعلم كيفية إنشاء الكلاسات والكائنات في Java، والفرق بينهما.",
                        "duration_hours": 3,
                        "order": 2
                    },
                ],
                "tds": [
                    {
                        "id": "td1",
                        "title": "TD 1: أساسيات البرمجة الشيئية",
                        "number": 1,
                        "exercises": [
                            {
                                "id": "ex1",
                                "title": "إنشاء كلاس بسيط",
                                "description": "أنشئ كلاس Student يحتوي على name و age",
                                "difficulty": "easy"
                            },
                            {
                                "id": "ex2",
                                "title": "الطرق (Methods)",
                                "description": "أضف methods للكلاس Student",
                                "difficulty": "medium"
                            }
                        ]
                    }
                ],
                "exams": [
                    {
                        "id": "e1",
                        "title": "امتحان جزئي",
                        "type": "midterm",
                        "date": None,
                        "duration_minutes": 90,
                        "total_points": 20,
                        "questions": [
                            {
                                "id": "q1",
                                "text": "ما هو الفرق بين الكلاس والكائن؟",
                                "points": 5,
                                "type": "essay"
                            }
                        ]
                    }
                ],
                "resources": []
            }
        }
        
        # Return mock data for known modules, or generic for others
        if module_id in mock_modules:
            data = mock_modules[module_id]
            return {
                **data,
                "speciality": {
                    "id": "spec_1",
                    "name": "علوم الحاسوب",
                    "code": "CS"
                },
                "courses_total_hours": sum(c.get("duration_hours", 0) for c in data["courses"]),
                "total_exercises": sum(len(td.get("exercises", [])) for td in data["tds"])
            }
        else:
            # Generic mock data
            return {
                "module": {
                    "id": module_id,
                    "name": "مادة تجريبية",
                    "name_fr": "Module Test",
                    "code": "TEST",
                    "year": "L1",
                    "semester": 1,
                    "credits": 3,
                    "coefficient": 2,
                    "difficulty": 5,
                    "description": "مادة تجريبية للاختبار"
                },
                "speciality": {
                    "id": "spec_1",
                    "name": "علوم الحاسوب",
                    "code": "CS"
                },
                "courses": [
                    {
                        "id": "c1",
                        "title": "درس تجريبي",
                        "chapter": 1,
                        "content": "محتوى تجريبي للدرس",
                        "duration_hours": 2,
                        "order": 1
                    }
                ],
                "courses_total_hours": 2,
                "tds": [
                    {
                        "id": "td1",
                        "title": "TD تجريبي",
                        "number": 1,
                        "exercises": [
                            {
                                "id": "ex1",
                                "title": "تمرين تجريبي",
                                "description": "وصف التمرين",
                                "difficulty": "medium"
                            }
                        ]
                    }
                ],
                "total_exercises": 1,
                "exams": [],
                "resources": []
            }
    
    try:
        db = MongoDB.get_db()
        
        if not db:
            # DB not available, use mock data
            is_connected = False
            module = None
        else:
            # Get module
            try:
                module = await db.modules.find_one({"id": module_id})
                if not module:
                    is_connected = False
                else:
                    is_connected = True
            except Exception as e:
                # Connection error, use mock data
                print(f"[WARN] MongoDB query error: {e}")
                is_connected = False
                module = None
        
        # If module not found or DB not connected, return mock data
        if not is_connected or not module:
            # Return mock module details based on module_id
            mock_modules = {
                "mod_1": {
                    "module": {
                        "id": "mod_1",
                        "name": "البرمجة الشيئية",
                        "name_fr": "Programmation Orientée Objet",
                        "code": "POO",
                        "year": "L1",
                        "semester": 1,
                        "credits": 4,
                        "coefficient": 3,
                        "difficulty": 7,
                        "description": "مقدمة في البرمجة الشيئية باستخدام Java"
                    },
                    "courses": [
                        {
                            "id": "c1",
                            "title": "مقدمة في البرمجة الشيئية",
                            "chapter": 1,
                            "content": "في هذا الدرس سنتعرف على مفاهيم البرمجة الشيئية الأساسية: الكلاسات، الكائنات، الوراثة، والتغليف.",
                            "duration_hours": 2,
                            "order": 1
                        },
                        {
                            "id": "c2",
                            "title": "الكلاسات والكائنات",
                            "chapter": 2,
                            "content": "سنتعلم كيفية إنشاء الكلاسات والكائنات في Java، والفرق بينهما.",
                            "duration_hours": 3,
                            "order": 2
                        },
                    ],
                    "tds": [
                        {
                            "id": "td1",
                            "title": "TD 1: أساسيات البرمجة الشيئية",
                            "number": 1,
                            "exercises": [
                                {
                                    "id": "ex1",
                                    "title": "إنشاء كلاس بسيط",
                                    "description": "أنشئ كلاس Student يحتوي على name و age",
                                    "difficulty": "easy"
                                },
                                {
                                    "id": "ex2",
                                    "title": "الطرق (Methods)",
                                    "description": "أضف methods للكلاس Student",
                                    "difficulty": "medium"
                                }
                            ]
                        }
                    ],
                    "exams": [
                        {
                            "id": "e1",
                            "title": "امتحان جزئي",
                            "type": "midterm",
                            "date": None,
                            "duration_minutes": 90,
                            "total_points": 20,
                            "questions": [
                                {
                                    "id": "q1",
                                    "text": "ما هو الفرق بين الكلاس والكائن؟",
                                    "points": 5,
                                    "type": "essay"
                                }
                            ]
                        }
                    ],
                    "resources": []
                }
            }
            
            # Return mock data for known modules, or generic for others
            if module_id in mock_modules:
                data = mock_modules[module_id]
                return {
                    **data,
                    "speciality": {
                        "id": "spec_1",
                        "name": "علوم الحاسوب",
                        "code": "CS"
                    },
                    "courses_total_hours": sum(c.get("duration_hours", 0) for c in data["courses"]),
                    "total_exercises": sum(len(td.get("exercises", [])) for td in data["tds"])
                }
            else:
                # Generic mock data
                return {
                    "module": {
                        "id": module_id,
                        "name": "مادة تجريبية",
                        "name_fr": "Module Test",
                        "code": "TEST",
                        "year": "L1",
                        "semester": 1,
                        "credits": 3,
                        "coefficient": 2,
                        "difficulty": 5,
                        "description": "مادة تجريبية للاختبار"
                    },
                    "speciality": {
                        "id": "spec_1",
                        "name": "علوم الحاسوب",
                        "code": "CS"
                    },
                    "courses": [
                        {
                            "id": "c1",
                            "title": "درس تجريبي",
                            "chapter": 1,
                            "content": "محتوى تجريبي للدرس",
                            "duration_hours": 2,
                            "order": 1
                        }
                    ],
                    "courses_total_hours": 2,
                    "tds": [
                        {
                            "id": "td1",
                            "title": "TD تجريبي",
                            "number": 1,
                            "exercises": [
                                {
                                    "id": "ex1",
                                    "title": "تمرين تجريبي",
                                    "description": "وصف التمرين",
                                    "difficulty": "medium"
                                }
                            ]
                        }
                    ],
                    "total_exercises": 1,
                    "exams": [],
                    "resources": []
                }
        
        # Get speciality
        try:
            speciality = await db.specialities.find_one({"id": module.get("speciality_id")})
        except Exception:
            speciality = None
        
        # Get courses
        courses = []
        try:
            async for course in db.courses.find({"module_id": module_id}).sort("order", 1):
                courses.append({
                    "id": course.get("id"),
                    "title": course.get("title", "درس بدون عنوان"),
                    "chapter": course.get("chapter", 1),
                    "content": course.get("content", "لا يوجد محتوى متاح حالياً."),
                    "duration_hours": course.get("duration_hours", 2),
                    "order": course.get("order", 0)
                })
        except Exception:
            # If courses query fails, use empty list
            courses = []
        
        # Get TDs with exercises
        tds = []
        try:
            async for td in db.tds.find({"module_id": module_id}).sort("number", 1):
                exercises = td.get("exercises", [])
                # Ensure each exercise has all required fields
                formatted_exercises = []
                for ex in exercises:
                    formatted_exercises.append({
                        "id": ex.get("id", f"ex-{len(formatted_exercises)}"),
                        "title": ex.get("title", "تمرين بدون عنوان"),
                        "description": ex.get("description", "لا يوجد وصف متاح."),
                        "difficulty": ex.get("difficulty", "medium")
                    })
                
                tds.append({
                    "id": td.get("id"),
                    "title": td.get("title", "TD بدون عنوان"),
                    "number": td.get("number", 1),
                    "exercises": formatted_exercises
                })
        except Exception:
            # If TDs query fails, use empty list
            tds = []
        
        # Get exams with questions
        exams = []
        try:
            async for exam in db.exams.find({"module_id": module_id}):
                questions = exam.get("questions", [])
                # Ensure each question has all required fields
                formatted_questions = []
                for q in questions:
                    formatted_questions.append({
                        "id": q.get("id", f"q-{len(formatted_questions)}"),
                        "text": q.get("text", q.get("question", "سؤال بدون نص")),
                        "points": q.get("points", q.get("point", 1)),
                        "type": q.get("type", "multiple_choice")
                    })
                
                exams.append({
                    "id": exam.get("id"),
                    "title": exam.get("title", "امتحان بدون عنوان"),
                    "type": exam.get("type", "midterm"),
                    "date": str(exam.get("date")) if exam.get("date") else None,
                    "duration_minutes": exam.get("duration_minutes", 90),
                    "total_points": exam.get("total_points", 20),
                    "questions": formatted_questions
                })
        except Exception:
            # If exams query fails, use empty list
            exams = []
        
        # Get resources with ratings
        resources = []
        try:
            async for resource in db.resources.find({"module_id": module_id}).sort("average_rating", -1):
                resources.append({
                    "id": resource.get("id"),
                    "title": resource.get("title"),
                    "type": resource.get("type"),
                    "url": resource.get("url"),
                    "thumbnail": resource.get("thumbnail"),
                    "duration": resource.get("duration"),
                    "channel": resource.get("channel"),
                    "description": resource.get("description"),
                    "tags": resource.get("tags", []),
                    "average_rating": resource.get("average_rating", 0),
                    "rating_count": resource.get("rating_count", 0),
                    "language": resource.get("language", "ar"),
                    "course_id": resource.get("course_id")
                })
        except Exception:
            # If resources query fails, use empty list
            resources = []
        
        return {
            "module": {
                "id": module.get("id"),
                "name": module.get("name"),
                "name_fr": module.get("name_fr"),
                "code": module.get("code"),
                "year": module.get("year"),
                "semester": module.get("semester"),
                "credits": module.get("credits"),
                "coefficient": module.get("coefficient"),
                "difficulty": module.get("difficulty"),
                "description": module.get("description")
            },
            "speciality": {
                "id": speciality.get("id") if speciality else None,
                "name": speciality.get("name") if speciality else None,
                "code": speciality.get("code") if speciality else None
            },
            "courses": courses,
            "courses_total_hours": sum(c.get("duration_hours", 0) for c in courses),
            "tds": tds,
            "total_exercises": sum(len(td.get("exercises", [])) for td in tds),
            "exams": exams,
            "resources": resources
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/student/{email}")
async def get_student_data(email: str):
    """Get complete student data with modules, courses, TDs, and exams"""
    from app.core.mongodb import MongoDB
    
    # If MongoDB not connected, return mock data with sample modules
    if not MongoDB.is_connected():
        # Return mock data with sample modules for demo
        sample_modules = [
            {
                "id": "mod_1",
                "name": "البرمجة الشيئية",
                "code": "POO",
                "year": "L1",
                "semester": 1,
                "credits": 4,
                "courses": [
                    {"id": "c1", "title": "مقدمة في البرمجة الشيئية", "chapter": 1, "duration_hours": 2},
                    {"id": "c2", "title": "الكلاسات والكائنات", "chapter": 2, "duration_hours": 3},
                ],
                "courses_count": 8,
                "tds": [
                    {"id": "td1", "title": "TD 1: أساسيات", "number": 1, "exercises_count": 5},
                    {"id": "td2", "title": "TD 2: الكلاسات", "number": 2, "exercises_count": 6},
                ],
                "tds_count": 6,
                "exams": [
                    {"id": "e1", "title": "امتحان جزئي", "type": "midterm", "duration_minutes": 90, "total_points": 20},
                ],
                "exams_count": 2,
                "progress": {
                    "courses_completed": 4,
                    "tds_completed": 3,
                    "grade": None
                }
            },
            {
                "id": "mod_2",
                "name": "هياكل البيانات والخوارزميات",
                "code": "SDA",
                "year": "L1",
                "semester": 1,
                "credits": 5,
                "courses": [
                    {"id": "c3", "title": "المصفوفات والقوائم", "chapter": 1, "duration_hours": 3},
                    {"id": "c4", "title": "الأشجار", "chapter": 2, "duration_hours": 4},
                ],
                "courses_count": 10,
                "tds": [
                    {"id": "td3", "title": "TD 1: المصفوفات", "number": 1, "exercises_count": 7},
                ],
                "tds_count": 8,
                "exams": [
                    {"id": "e2", "title": "امتحان نهائي", "type": "final", "duration_minutes": 120, "total_points": 30},
                ],
                "exams_count": 2,
                "progress": {
                    "courses_completed": 6,
                    "tds_completed": 4,
                    "grade": None
                }
            },
            {
                "id": "mod_3",
                "name": "قواعد البيانات",
                "code": "BD",
                "year": "L2",
                "semester": 1,
                "credits": 4,
                "courses": [
                    {"id": "c5", "title": "مقدمة في قواعد البيانات", "chapter": 1, "duration_hours": 2},
                ],
                "courses_count": 7,
                "tds": [
                    {"id": "td4", "title": "TD 1: SQL", "number": 1, "exercises_count": 4},
                ],
                "tds_count": 5,
                "exams": [],
                "exams_count": 1,
                "progress": {
                    "courses_completed": 3,
                    "tds_completed": 2,
                    "grade": None
                }
            },
            {
                "id": "mod_4",
                "name": "الذكاء الاصطناعي",
                "code": "IA",
                "year": "M1",
                "semester": 1,
                "credits": 6,
                "courses": [
                    {"id": "c6", "title": "مقدمة في الذكاء الاصطناعي", "chapter": 1, "duration_hours": 3},
                ],
                "courses_count": 12,
                "tds": [
                    {"id": "td5", "title": "TD 1: التعلم الآلي", "number": 1, "exercises_count": 8},
                ],
                "tds_count": 10,
                "exams": [],
                "exams_count": 2,
                "progress": {
                    "courses_completed": 5,
                    "tds_completed": 4,
                    "grade": None
                }
            },
            {
                "id": "mod_5",
                "name": "الرياضيات المتقطعة",
                "code": "MD",
                "year": "L1",
                "semester": 1,
                "credits": 3,
                "courses": [
                    {"id": "c7", "title": "المنطق الرياضي", "chapter": 1, "duration_hours": 2},
                ],
                "courses_count": 6,
                "tds": [
                    {"id": "td6", "title": "TD 1: المنطق", "number": 1, "exercises_count": 5},
                ],
                "tds_count": 4,
                "exams": [],
                "exams_count": 1,
                "progress": {
                    "courses_completed": 4,
                    "tds_completed": 3,
                    "grade": None
                }
            }
        ]
        
        return {
            "student": {
                "name": "طالب تجريبي",
                "email": email,
                "level": "L1",
                "semester": 1
            },
            "speciality": {
                "id": "spec_1",
                "name": "علوم الحاسوب",
                "code": "CS"
            },
            "enrolled_modules": sample_modules,
            "total_modules": len(sample_modules)
        }
    
    try:
        db = MongoDB.get_db()
        
        # Get user
        user = await db.users.find_one({"email": email})
        if not user:
            # For demo user, create with default data
            if email == "demo@student.ai":
                # Create demo user if doesn't exist
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                
                demo_user = {
                    "email": email,
                    "hashed_password": pwd_context.hash("demo123"),
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
                        "notifications": True
                    },
                    "is_active": True,
                    "created_at": datetime.utcnow()
                }
                await db.users.insert_one(demo_user)
                user = demo_user
                
                # Add some default modules if none exist
                if not user.get("enrolled_modules"):
                    # Get available modules
                    available_modules = await db.modules.find({}).to_list(length=5)
                    if available_modules:
                        module_ids = [m["id"] for m in available_modules]
                        await db.users.update_one(
                            {"email": email},
                            {"$set": {"enrolled_modules": module_ids}}
                        )
                        user["enrolled_modules"] = module_ids
            else:
                return {"error": "Student not found"}
        
        # Get speciality
        speciality = await db.specialities.find_one({"id": user.get("speciality_id")})
        
        # If no enrolled modules, try to get some default ones
        enrolled_module_ids = user.get("enrolled_modules", [])
        if not enrolled_module_ids:
            # Get some default modules
            default_modules = await db.modules.find({}).limit(5).to_list(length=5)
            if default_modules:
                enrolled_module_ids = [m["id"] for m in default_modules]
                # Update user with default modules
                await db.users.update_one(
                    {"email": email},
                    {"$set": {"enrolled_modules": enrolled_module_ids}}
                )
                print(f"[INFO] Auto-added {len(enrolled_module_ids)} modules to user {email}")
        
        # Get enrolled modules with details
        enrolled_modules = []
        for module_id in enrolled_module_ids:
            module = await db.modules.find_one({"id": module_id})
            if module:
                # Get courses for this module
                courses = []
                async for course in db.courses.find({"module_id": module_id}):
                    courses.append({
                        "id": course.get("id", f"course-{len(courses)}"),
                        "title": course.get("title", "درس بدون عنوان"),
                        "chapter": course.get("chapter", 1),
                        "duration_hours": course.get("duration_hours", 2)
                    })
                
                # Get TDs for this module
                tds = []
                async for td in db.tds.find({"module_id": module_id}):
                    exercises = td.get("exercises", [])
                    tds.append({
                        "id": td.get("id", f"td-{len(tds)}"),
                        "title": td.get("title", "TD بدون عنوان"),
                        "number": td.get("number", len(tds) + 1),
                        "exercises_count": len(exercises)
                    })
                
                # Get exams for this module
                exams = []
                async for exam in db.exams.find({"module_id": module_id}):
                    exams.append({
                        "id": exam.get("id", f"exam-{len(exams)}"),
                        "title": exam.get("title", "امتحان بدون عنوان"),
                        "type": exam.get("type", "midterm"),
                        "duration_minutes": exam.get("duration_minutes", 90),
                        "total_points": exam.get("total_points", 20)
                    })
                
                # Get progress for this module
                progress = user.get("progress", {}).get(module_id, {})
                
                enrolled_modules.append({
                    "id": module.get("id"),
                    "name": module.get("name"),
                    "code": module.get("code"),
                    "year": module.get("year"),
                    "semester": module.get("semester"),
                    "credits": module.get("credits"),
                    "courses": courses,
                    "courses_count": len(courses),
                    "tds": tds,
                    "tds_count": len(tds),
                    "exams": exams,
                    "exams_count": len(exams),
                    "progress": progress
                })
        
        return {
            "student": {
                "name": user.get("name"),
                "email": user.get("email"),
                "level": user.get("level"),
                "semester": user.get("semester")
            },
            "speciality": {
                "id": speciality.get("id") if speciality else None,
                "name": speciality.get("name") if speciality else None,
                "code": speciality.get("code") if speciality else None
            },
            "enrolled_modules": enrolled_modules,
            "total_modules": len(enrolled_modules)
        }
    except Exception as e:
        return {"error": str(e)}


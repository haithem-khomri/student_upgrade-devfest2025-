from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

from app.core.mongodb import Collections, MongoDB
from app.schemas.mongodb_models import PyObjectId

router = APIRouter()

# ============ MODULES ============

class ModuleCreate(BaseModel):
    name: str
    name_fr: Optional[str] = None
    code: str
    speciality_id: str
    year: str
    semester: int
    credits: int
    coefficient: int
    difficulty: int = Field(ge=1, le=10)
    description: Optional[str] = None

class ModuleUpdate(BaseModel):
    name: Optional[str] = None
    name_fr: Optional[str] = None
    code: Optional[str] = None
    speciality_id: Optional[str] = None
    year: Optional[str] = None
    semester: Optional[int] = None
    credits: Optional[int] = None
    coefficient: Optional[int] = None
    difficulty: Optional[int] = Field(None, ge=1, le=10)
    description: Optional[str] = None

@router.post("/modules")
async def create_module(module: ModuleCreate):
    """Create a new module"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        module_doc = {
            "name": module.name,
            "name_fr": module.name_fr,
            "code": module.code,
            "speciality_id": PyObjectId(module.speciality_id),
            "year": module.year,
            "semester": module.semester,
            "credits": module.credits,
            "coefficient": module.coefficient,
            "difficulty": module.difficulty,
            "description": module.description,
            "created_at": datetime.utcnow()
        }
        
        result = await Collections.modules().insert_one(module_doc)
        return {"id": str(result.inserted_id), "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating module: {str(e)}")

@router.get("/modules")
async def get_modules(speciality_id: Optional[str] = None, year: Optional[str] = None):
    """Get all modules with optional filters"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        query = {}
        if speciality_id:
            query["speciality_id"] = PyObjectId(speciality_id)
        if year:
            query["year"] = year
        
        modules = []
        async for module in Collections.modules().find(query).sort("code", 1):
            modules.append({
                "id": str(module["_id"]),
                "name": module["name"],
                "name_fr": module.get("name_fr"),
                "code": module["code"],
                "year": module["year"],
                "semester": module["semester"],
                "credits": module["credits"],
                "coefficient": module.get("coefficient"),
                "difficulty": module.get("difficulty"),
                "description": module.get("description")
            })
        
        return modules
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching modules: {str(e)}")

@router.put("/modules/{module_id}")
async def update_module(module_id: str, module: ModuleUpdate):
    """Update a module"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        module_obj_id = PyObjectId(module_id)
        update_data = {k: v for k, v in module.model_dump(exclude_unset=True).items() if v is not None}
        
        if "speciality_id" in update_data:
            update_data["speciality_id"] = PyObjectId(update_data["speciality_id"])
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await Collections.modules().update_one(
            {"_id": module_obj_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Module not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating module: {str(e)}")

@router.delete("/modules/{module_id}")
async def delete_module(module_id: str):
    """Delete a module"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        module_obj_id = PyObjectId(module_id)
        
        # Also delete related courses, TDs, and exams
        await Collections.courses().delete_many({"module_id": module_obj_id})
        await Collections.tds().delete_many({"module_id": module_obj_id})
        await Collections.exams().delete_many({"module_id": module_obj_id})
        
        result = await Collections.modules().delete_one({"_id": module_obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Module not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting module: {str(e)}")

# ============ COURSES ============

class CourseCreate(BaseModel):
    module_id: str
    title: str
    chapter: Optional[int] = None
    content: Optional[str] = None
    duration_hours: Optional[int] = None
    order: Optional[int] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    chapter: Optional[int] = None
    content: Optional[str] = None
    duration_hours: Optional[int] = None
    order: Optional[int] = None

@router.post("/courses")
async def create_course(course: CourseCreate):
    """Create a new course"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        course_doc = {
            "module_id": PyObjectId(course.module_id),
            "title": course.title,
            "chapter": course.chapter,
            "content": course.content,
            "duration_hours": course.duration_hours,
            "order": course.order,
            "created_at": datetime.utcnow()
        }
        
        result = await Collections.courses().insert_one(course_doc)
        return {"id": str(result.inserted_id), "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating course: {str(e)}")

@router.get("/courses")
async def get_courses(module_id: Optional[str] = None):
    """Get all courses with optional module filter"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        query = {}
        if module_id:
            query["module_id"] = PyObjectId(module_id)
        
        courses = []
        async for course in Collections.courses().find(query).sort("order", 1):
            courses.append({
                "id": str(course["_id"]),
                "title": course["title"],
                "chapter": course.get("chapter"),
                "content": course.get("content"),
                "duration_hours": course.get("duration_hours"),
                "order": course.get("order")
            })
        
        return courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

@router.put("/courses/{course_id}")
async def update_course(course_id: str, course: CourseUpdate):
    """Update a course"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        course_obj_id = PyObjectId(course_id)
        update_data = {k: v for k, v in course.model_dump(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await Collections.courses().update_one(
            {"_id": course_obj_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating course: {str(e)}")

@router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    """Delete a course"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        course_obj_id = PyObjectId(course_id)
        result = await Collections.courses().delete_one({"_id": course_obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting course: {str(e)}")

# ============ TDs ============

class Exercise(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    difficulty: str = "medium"

class TDCreate(BaseModel):
    module_id: str
    title: str
    number: Optional[int] = None
    exercises: List[Exercise] = []

class TDUpdate(BaseModel):
    title: Optional[str] = None
    number: Optional[int] = None
    exercises: Optional[List[Exercise]] = None

@router.post("/tds")
async def create_td(td: TDCreate):
    """Create a new TD"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        td_doc = {
            "module_id": PyObjectId(td.module_id),
            "title": td.title,
            "number": td.number,
            "exercises": [ex.model_dump() for ex in td.exercises],
            "created_at": datetime.utcnow()
        }
        
        result = await Collections.tds().insert_one(td_doc)
        return {"id": str(result.inserted_id), "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating TD: {str(e)}")

@router.get("/tds")
async def get_tds(module_id: Optional[str] = None):
    """Get all TDs with optional module filter"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        query = {}
        if module_id:
            query["module_id"] = PyObjectId(module_id)
        
        tds = []
        async for td in Collections.tds().find(query).sort("number", 1):
            tds.append({
                "id": str(td["_id"]),
                "title": td["title"],
                "number": td.get("number"),
                "exercises": td.get("exercises", [])
            })
        
        return tds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching TDs: {str(e)}")

@router.put("/tds/{td_id}")
async def update_td(td_id: str, td: TDUpdate):
    """Update a TD"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        td_obj_id = PyObjectId(td_id)
        update_data = {k: v for k, v in td.model_dump(exclude_unset=True).items() if v is not None}
        
        if "exercises" in update_data:
            update_data["exercises"] = [ex.model_dump() if isinstance(ex, Exercise) else ex for ex in update_data["exercises"]]
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await Collections.tds().update_one(
            {"_id": td_obj_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="TD not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating TD: {str(e)}")

@router.delete("/tds/{td_id}")
async def delete_td(td_id: str):
    """Delete a TD"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        td_obj_id = PyObjectId(td_id)
        result = await Collections.tds().delete_one({"_id": td_obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="TD not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting TD: {str(e)}")

# ============ EXAMS ============

class Question(BaseModel):
    id: Optional[str] = None
    text: str
    points: int
    type: str

class ExamCreate(BaseModel):
    module_id: str
    title: str
    type: str
    exam_date: datetime
    duration_minutes: int
    total_points: int
    questions: List[Question] = []

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    exam_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    total_points: Optional[int] = None
    questions: Optional[List[Question]] = None

@router.post("/exams")
async def create_exam(exam: ExamCreate):
    """Create a new exam"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        exam_doc = {
            "module_id": PyObjectId(exam.module_id),
            "title": exam.title,
            "type": exam.type,
            "exam_date": exam.exam_date,
            "duration_minutes": exam.duration_minutes,
            "total_points": exam.total_points,
            "questions": [q.model_dump() for q in exam.questions],
            "created_at": datetime.utcnow()
        }
        
        result = await Collections.exams().insert_one(exam_doc)
        return {"id": str(result.inserted_id), "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating exam: {str(e)}")

@router.get("/exams")
async def get_exams(module_id: Optional[str] = None):
    """Get all exams with optional module filter"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        query = {}
        if module_id:
            query["module_id"] = PyObjectId(module_id)
        
        exams = []
        async for exam in Collections.exams().find(query).sort("exam_date", 1):
            exams.append({
                "id": str(exam["_id"]),
                "title": exam["title"],
                "type": exam.get("type"),
                "exam_date": exam.get("exam_date").isoformat() if exam.get("exam_date") else None,
                "duration_minutes": exam.get("duration_minutes"),
                "total_points": exam.get("total_points"),
                "questions": exam.get("questions", [])
            })
        
        return exams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching exams: {str(e)}")

@router.put("/exams/{exam_id}")
async def update_exam(exam_id: str, exam: ExamUpdate):
    """Update an exam"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        exam_obj_id = PyObjectId(exam_id)
        update_data = {k: v for k, v in exam.model_dump(exclude_unset=True).items() if v is not None}
        
        if "questions" in update_data:
            update_data["questions"] = [q.model_dump() if isinstance(q, Question) else q for q in update_data["questions"]]
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await Collections.exams().update_one(
            {"_id": exam_obj_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating exam: {str(e)}")

@router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    """Delete an exam"""
    if not MongoDB.is_connected():
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        exam_obj_id = PyObjectId(exam_id)
        result = await Collections.exams().delete_one({"_id": exam_obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting exam: {str(e)}")


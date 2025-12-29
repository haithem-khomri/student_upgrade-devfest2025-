"""
Content generator router
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import json
import io

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.content import GeneratedContent
from app.schemas.content_generator import GeneratedContentResponse
from app.services.content_generator_service import ContentGeneratorService

router = APIRouter()


def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from PDF file"""
    try:
        import PyPDF2
        
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
        text = ""
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )


@router.post("/extract-pdf")
async def extract_pdf_text(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Extract text from PDF file"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Read file content
    pdf_content = await file.read()
    
    # Extract text
    extracted_text = extract_text_from_pdf(pdf_content)
    
    if not extracted_text or len(extracted_text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Could not extract meaningful text from PDF. The PDF might be image-based or corrupted."
        )
    
    return {
        "text": extracted_text,
        "filename": file.filename,
        "length": len(extracted_text),
    }


@router.post("/generate", response_model=GeneratedContentResponse)
async def generate_content(
    type: str = Form(...),
    content: str = Form(...),
    module_id: str = Form(None),
    options: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate study content from text"""
    service = ContentGeneratorService()
    
    options_dict = json.loads(options) if options else {}
    
    generated = await service.generate(
        content_type=type,
        content=content,
        module_id=module_id,
        options=options_dict,
    )
    
    # Save to database
    db_content = GeneratedContent(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=type,
        content=json.dumps(generated["content"]),
        module_id=module_id,
        metadata=json.dumps(generated.get("metadata", {})),
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    return GeneratedContentResponse(
        id=db_content.id,
        type=db_content.type,
        content=json.loads(db_content.content),
        metadata=json.loads(db_content.metadata) if db_content.metadata else None,
    )


@router.get("/history", response_model=List[GeneratedContentResponse])
async def get_generation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
):
    """Get content generation history"""
    contents = (
        db.query(GeneratedContent)
        .filter(GeneratedContent.user_id == current_user.id)
        .order_by(GeneratedContent.created_at.desc())
        .limit(limit)
        .all()
    )
    
    result = []
    for content in contents:
        result.append(
            GeneratedContentResponse(
                id=content.id,
                type=content.type,
                content=json.loads(content.content),
                metadata=json.loads(content.metadata) if content.metadata else None,
            )
        )
    
    return result


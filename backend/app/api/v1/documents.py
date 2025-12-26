import shutil
import os
from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app import schemas
from app.services.rag_service import rag_service
from app.api.v1 import auth

router = APIRouter()

UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    # current_user: models.User = Depends(auth.get_current_active_user) # TODO: Enable auth
) -> Any:
    """
    Upload a PDF document and ingest it into the RAG system.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # Ingest into RAG
    try:
        chunks = rag_service.ingest_file(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Ingestion failed: {str(e)}")

    return {
        "id": "temp_id", # In real app, save to DB and get ID
        "filename": file.filename,
        "chunks_created": chunks,
        "message": "Document uploaded and indexed successfully"
    }

@router.post("/query")
def query_knowledge_base(query: str):
    results = rag_service.search(query)
    return [{"content": doc.page_content, "metadata": doc.metadata} for doc in results]

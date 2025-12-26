from fastapi import APIRouter, BackgroundTasks
from app.services.auto_learner import auto_learner
from app.services.rag_service import rag_service
from app.schemas.admin import AnalyticsResponse, KnowledgeBaseStats, AutoLearningTrigger, DocumentInfo
from app.services.verification_service import verification_service
from pydantic import BaseModel
from datetime import datetime
import os

router = APIRouter()

# In-memory storage for demo (replace with DB in production)
query_log = []
upload_log = []

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics():
    """
    Get system analytics and statistics
    """
    # Calculate metrics
    total_queries = len(query_log)
    queries_today = len([q for q in query_log if q.get('date') == datetime.now().date().isoformat()])
    
    # Knowledge health: percentage of FAISS index health (mock for now)
    knowledge_health = 85.0 if rag_service.vector_store else 0.0
    
    recent_queries = [q.get('query', 'Unknown') for q in query_log[-5:]]
    
    return {
        "total_queries": total_queries,
        "total_documents": len(upload_log),
        "queries_today": queries_today,
        "knowledge_health": knowledge_health,
        "recent_queries": recent_queries
    }

@router.get("/knowledge-base", response_model=KnowledgeBaseStats)
def get_knowledge_base_stats():
    """
    Get detailed knowledge base statistics
    """
    documents_info = []
    for doc in upload_log:
        documents_info.append({
            "filename": doc.get('filename', 'Unknown'),
            "chunks": doc.get('chunks', 0),
            "indexed_at": doc.get('indexed_at', 'N/A'),
            "size_kb": doc.get('size_kb', 0)
        })
    
    # Calculate vector store size (approximate)
    vector_store_path = rag_service.vector_store_path
    vector_store_size = 0
    if os.path.exists(vector_store_path):
        for file in os.listdir(vector_store_path):
            file_path = os.path.join(vector_store_path, file)
            if os.path.isfile(file_path):
                vector_store_size += os.path.getsize(file_path)
    
    return {
        "total_documents": len(upload_log),
        "total_chunks": sum(d.get('chunks', 0) for d in upload_log),
        "vector_store_size_mb": round(vector_store_size / (1024 * 1024), 2),
        "last_updated": upload_log[-1].get('indexed_at', 'Never') if upload_log else 'Never',
        "documents": documents_info
    }

@router.post("/auto-learn/trigger")
def trigger_auto_learning(
    background_tasks: BackgroundTasks, 
    config: AutoLearningTrigger
):
    """
    Trigger the auto-learning engine on a specific directory
    """
    if not os.path.exists(config.directory_path):
        os.makedirs(config.directory_path, exist_ok=True)
    
    auto_learner.add_watch_directory(config.directory_path)
    background_tasks.add_task(auto_learner.scan_and_learn)
    
    return {
        "message": f"Auto-learning triggered for {config.directory_path}",
        "status": "running",
        "directory": config.directory_path
    }

@router.post("/log-query")
def log_query(query: str):
    """
    Log a query for analytics (called by chat endpoint)
    """
    query_log.append({
        "query": query,
        "date": datetime.now().date().isoformat(),
        "timestamp": datetime.now().isoformat()
    })
    return {"status": "logged"}



@router.post("/log-upload")
def log_upload(filename: str, chunks: int, size_kb: int):
    """
    Log a document upload for analytics
    """
    upload_log.append({
        "filename": filename,
        "chunks": chunks,
        "size_kb": size_kb,
        "indexed_at": datetime.now().isoformat()
    })
    return {"status": "logged"}

class VerificationDecision(BaseModel):
    remarks: str = None

@router.get("/verification/queue")
def get_verification_queue():
    """
    Get all pending verification cases
    """
    return verification_service.get_pending_cases()

@router.post("/verification/{case_id}/approve")
def approve_verification(case_id: str, decision: VerificationDecision):
    """
    Approve a verification case
    """
    success = verification_service.update_case_status(case_id, "approved", decision.remarks)
    if not success:
        return {"error": "Case not found"}
    return {"status": "approved", "case_id": case_id}

@router.post("/verification/{case_id}/reject")
def reject_verification(case_id: str, decision: VerificationDecision):
    """
    Reject a verification case
    """
    success = verification_service.update_case_status(case_id, "rejected", decision.remarks)
    if not success:
        return {"error": "Case not found"}
    return {"status": "rejected", "case_id": case_id}

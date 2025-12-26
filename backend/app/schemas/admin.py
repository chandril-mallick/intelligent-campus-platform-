from pydantic import BaseModel
from typing import List, Dict, Any

class AnalyticsResponse(BaseModel):
    total_queries: int
    total_documents: int
    queries_today: int
    knowledge_health: float
    recent_queries: List[str]

class DocumentInfo(BaseModel):
    filename: str
    chunks: int
    indexed_at: str
    size_kb: int

class KnowledgeBaseStats(BaseModel):
    total_documents: int
    total_chunks: int
    vector_store_size_mb: float
    last_updated: str
    documents: List[DocumentInfo]

class AutoLearningTrigger(BaseModel):
    directory_path: str
    recursive: bool = True

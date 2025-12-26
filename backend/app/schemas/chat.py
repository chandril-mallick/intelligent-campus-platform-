from typing import List, Optional, Dict
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    sources: Optional[List[str]] = None


class ChatRequest(BaseModel):
    query: str
    conversation_history: List[ChatMessage] = []
    session_id: Optional[str] = None
    role: Optional[str] = "student"  # student, faculty, etc.
    course: Optional[str] = None     # e.g., "OS", "DAA"

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, str]]
    suggested_questions: List[str]
    session_id: str

class ChatFeedback(BaseModel):
    session_id: str
    feedback_type: str  # "thumbs_up", "thumbs_down"
    comment: Optional[str] = None

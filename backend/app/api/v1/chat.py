from fastapi import APIRouter
from app.services.rag_service import rag_service
from app.services.llm_service import get_llm_service
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage, ChatFeedback
from typing import List, Dict, Optional
import uuid

router = APIRouter()

# In-memory conversation storage (replace with Redis/DB in production)
# In-memory storage (replace with DB/Redis in production)
conversations: Dict[str, List[ChatMessage]] = {}
feedback_store: List[Dict] = []

def generate_suggested_questions(context: str) -> List[str]:
    """
    Generate contextual follow-up questions based on the answer
    """
    # Simple rule-based suggestions (can be enhanced with LLM)
    suggestions = [
        "Can you explain this in more detail?",
        "What are the key points?",
        "Are there any examples?",
    ]
    return suggestions[:3]

@router.post("/chat", response_model=ChatResponse)
async def enhanced_chat(request: ChatRequest):
    """
    Enhanced chat endpoint with LLM-powered responses and conversation memory
    """
    # Generate or retrieve session ID
    session_id = request.session_id or str(uuid.uuid4())
    
    # Retrieve conversation history
    if session_id not in conversations:
        conversations[session_id] = []
    
    # Add user message to history
    conversations[session_id].append(
        ChatMessage(role="user", content=request.query)
    )
    
    # Build context from conversation history
    conversation_context = "\n".join([
        f"{msg.role}: {msg.content}" 
        for msg in conversations[session_id][-5:]  # Last 5 messages
    ])
    
    # Search knowledge base with context if provided
    context_filter = {}
    if request.role == "student" and request.course:
         # In a real vector DB, we would filter by metadata
         # context_filter = {"course": request.course}
         pass

    search_results = rag_service.search(request.query, k=3)
    
    # Get LLM service
    llm_service = get_llm_service()
    
    if not search_results:
        # No context available - use LLM to generate general response
        answer = llm_service.generate_simple_answer(request.query)
        sources = []
    else:
        # Combine search results into context
        context_text = "\n\n".join([
            f"Document {i+1}:\n{doc.page_content}" 
            for i, doc in enumerate(search_results)
        ])
        
        # Use LLM to generate coherent answer from context
        answer = llm_service.generate_answer(request.query, context_text)
        
        # Extract sources
        sources = [
            {
                "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                "metadata": str(doc.metadata)
            }
            for doc in search_results
        ]
    
    # Add assistant response to history
    conversations[session_id].append(
        ChatMessage(role="assistant", content=answer, sources=[s["metadata"] for s in sources])
    )
    
    # Generate suggested questions
    suggested_questions = generate_suggested_questions(answer)
    
    return ChatResponse(
        answer=answer,
        sources=sources,
        suggested_questions=suggested_questions,
        session_id=session_id
    )

@router.delete("/chat/{session_id}")
async def clear_conversation(session_id: str):
    """
    Clear conversation history for a session
    """
    if session_id in conversations:
        del conversations[session_id]
    return {"status": "cleared", "session_id": session_id}

@router.post("/chat/feedback")
async def submit_feedback(feedback: ChatFeedback):
    """
    Submit feedback for a chat session
    """
    feedback_entry = {
        "session_id": feedback.session_id,
        "type": feedback.feedback_type,
        "comment": feedback.comment,
        "timestamp": "now" # In real app use datetime.now()
    }
    feedback_store.append(feedback_entry)
    print(f"Feedback received: {feedback_entry}")
    return {"status": "received", "thank_you": True}

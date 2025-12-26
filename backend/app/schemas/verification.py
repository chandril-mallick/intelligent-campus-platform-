from pydantic import BaseModel
from typing import List, Dict, Optional

class VerificationReport(BaseModel):
    status: str  # "verified", "suspicious", "error"
    confidence_score: float
    total_text_blocks: int
    low_confidence_blocks: Optional[int] = 0
    issues: List[str]
    extracted_text: str
    details: List[Dict] = []

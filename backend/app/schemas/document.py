from typing import Optional
from pydantic import BaseModel

class DocumentUpload(BaseModel):
    filename: str
    content_type: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    chunks_created: int
    message: str

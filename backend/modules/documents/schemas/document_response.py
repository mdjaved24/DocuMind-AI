from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    title: str
    collection_id: int
    file_size: int
    created_at: datetime
    is_favorite: bool
    document_status: str
    processing_status: str
    mime_type: str
    extension: str

    model_config = ConfigDict(from_attributes=True)
    
    
from pydantic import BaseModel
from typing import Optional


class CollectionRequest(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_default: Optional[bool] = False
    
    

class CollectionUpdate(BaseModel):
    name:Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    
    
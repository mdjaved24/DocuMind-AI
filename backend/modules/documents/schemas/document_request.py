from pydantic import BaseModel
from fastapi import UploadFile, File


class DocumentRename(BaseModel):
    title:str
    

class DocumentMove(BaseModel):
    collection_id:int
    

class DocumentToggleFavorite(BaseModel):
    is_favorite:bool
    


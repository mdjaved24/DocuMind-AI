from fastapi import APIRouter, Depends, File, status, Response, HTTPException, Query, UploadFile
from modules.documents.schemas.collection_request import CollectionRequest, CollectionUpdate
from modules.documents.schemas.collection_response import CollectionResponse
from modules.documents.models.collection import Collections
import random
from core.database.authentication import get_password_hash, create_access_token, get_current_user
from core.database.settings import get_db
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from pathlib import Path
from typing import List, Optional
from sqlalchemy import asc, desc, func, select


document_router = APIRouter(prefix="/documents/v1", tags=['Documents'])


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@document_router.post("/upload")
async def add_document(doc:UploadFile=File(...)):
    
    if not doc:
        raise HTTPException(400, "No files attached to be uploaded")
    
    file_path = UPLOAD_DIR / doc.filename
    
    with open(file_path, 'wb') as f:
        content = await doc.read()
        f.write(content)
        
        return {"msg":"File Uploaded Successfully"}
    
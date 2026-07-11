from fastapi import APIRouter, Depends, status, Response, HTTPException, Query
from modules.documents.schemas.collection_request import CollectionRequest, CollectionUpdate
from modules.documents.schemas.collection_response import CollectionResponse
from modules.documents.models.collection import Collections
import random
from core.database.authentication import get_password_hash, create_access_token, get_current_user
from core.database.settings import get_db
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import asc, desc, func, or_, select


collection_router = APIRouter(prefix="/collections/v1", tags=['Collections'])

# Add Collections
@collection_router.post("/add", status_code=status.HTTP_201_CREATED)
def add_collection(request: CollectionRequest, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    name = request.name.strip()
    
    if not name:
        raise HTTPException(400, "Collection Name is required")
    
    if len(name) > 100:
        raise HTTPException(400, "Collection Name must not exceed 100 characters")
    
    collection = db.query(Collections).filter(Collections.user_id==current_user.id, func.lower(Collections.name)==name.lower()).first()
    
    if collection:
        raise HTTPException(400, "You have already taken the collection name. Kindly provide some other name")
    
    
    new_collection = Collections(
        uuid=str(uuid.uuid4().hex),
        user_id=current_user.id,
        name=name,
        description=request.description if request.description else "",
        color=request.color if request.color else "",
        icon=request.icon if request.icon else "",
        is_default=request.is_default,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_collection)
    db.commit()
    db.refresh(new_collection)
    
    
    data = {
        "uuid":new_collection.uuid,
        "name":new_collection.name,
        "created_at":new_collection.created_at,
    }
    
    
    return data



# Get collection
@collection_router.get("/get", response_model=List[CollectionResponse])
def get_collections(
    db:Session=Depends(get_db), 
    current_user=Depends(get_current_user),
    search:Optional[str]=Query(None),
    sort_by:str=Query('id'),
    order:str=Query('asc',pattern="^(asc|desc)$"),
    page:int=Query(1,ge=1),
    limit:int=Query(10,ge=1,le=100)
    ):
    
    query = select(Collections)
    
    query = query.where(Collections.user_id == current_user.id)
    
    # Apply Search
    if search:
        query = query.where(
        or_(
            Collections.name.ilike(f"%{search}%"),
            Collections.description.ilike(f"%{search}%")
        )
    )
    
    # Get total count for pagination metadata
    total_collections = db.scalar(select(func.count()).select_from(query.subquery()))
    
    # Apply sorting
    allowed_sort_fields = {
    "id": Collections.id,
    "name": Collections.name,
    "created_at": Collections.created_at,
    "updated_at": Collections.updated_at,
    }

    sort_col = allowed_sort_fields.get(sort_by, Collections.id)
    
    query = query.order_by(desc(sort_col) if order=="desc" else asc(sort_col))
    
    # Apply pagination
    collections = db.scalars(query.offset((page-1)*limit).limit(limit)).all()
    
    return collections



@collection_router.get("/collection/{id}", response_model=CollectionResponse)
def get_collection_details(id:int, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    collection = db.query(Collections).filter_by(id=id).first()
    
    if not collection:
        raise HTTPException(404, "Collection not found")
    
    if collection.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    
    return collection



@collection_router.patch("/collection/{id}")
def update_collection_details(id:int, request:CollectionUpdate, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    collection = db.query(Collections).filter_by(id=id).first()
    
    if not collection:
        raise HTTPException(404, "Collection not found")
    
    if collection.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    update_data = request.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(collection, key, value)
    
    collection.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(collection)
    
    return {"msg":"Collection details updated"}



@collection_router.delete("/collection/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(id:int, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    collection = db.query(Collections).filter_by(id=id).first()
    
    if not collection:
        raise HTTPException(404, "Collection not found")
    
    if collection.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    db.delete(collection)
    db.commit()
    
    
    return None
    
    
    
    
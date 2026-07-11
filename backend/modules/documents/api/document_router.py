import hashlib
import mimetypes
from fastapi import APIRouter, Body, Depends, File, Request, status, Response, HTTPException, Query, UploadFile, Form
from fastapi.responses import FileResponse
from modules.documents.schemas.collection_request import CollectionRequest, CollectionUpdate
from modules.documents.schemas.collection_response import CollectionResponse
from modules.documents.schemas.document_request import DocumentRename, DocumentMove, DocumentToggleFavorite
from modules.documents.schemas.document_response import DocumentResponse
from modules.documents.models.collection import Collections
from modules.documents.models.document import Documents, DocumentStatus, DocumentViews, DocumentActivity, ActivityAction
import random
from core.database.authentication import get_password_hash, create_access_token, get_current_user
from core.database.settings import get_db
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pathlib import Path
from typing import List, Optional
from sqlalchemy import asc, desc, func, or_, select, and_

from modules.ai.services.processing_jobs_service import ProcessingService
from modules.documents.services.document_service import DocumentService


document_router = APIRouter(prefix="/documents/v1", tags=['Documents'])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.csv', '.xls', '.xlsx']
MAXIMUM_FILE_SIZE = 20

# Helper function to log activity
def log_activity(db: Session, user_id: int, document_id: int, action: ActivityAction, metadata: dict = None):
    activity = DocumentActivity(
        user_id=user_id,
        document_id=document_id,
        action=action,
        activity_metadata=metadata or {}
    )
    db.add(activity)
    db.commit()


# ======================UPLOAD DOCUMENT======================================
@document_router.post("/upload")
async def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    collection_id: int = Form(...),
    is_favorite: bool = Form(False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return await DocumentService.upload_document(
        db=db,
        current_user=current_user,
        title=title,
        file=file,
        collection_id=collection_id,
        is_favorite=is_favorite,
        upload_dir=UPLOAD_DIR,
        allowed_extensions=ALLOWED_EXTENSIONS,
        max_file_size=MAXIMUM_FILE_SIZE,
    )
    
    

@document_router.get("/all", response_model=List[DocumentResponse])
def get_all_documents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    search: Optional[str] = Query(None),
    sort_by: str = Query('id'),
    order: str = Query('asc', pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = select(Documents)
    query = query.where(Documents.user_id == current_user.id)
    
    if search:
        query = query.where(Documents.title.ilike(f"%{search}%"))
    
    total_collections = db.scalar(select(func.count()).select_from(query.subquery()))
    
    allowed_sort_fields = {
        "id": Documents.id,
        "title": Documents.title,
        "created_at": Documents.created_at,
        "updated_at": Documents.updated_at,
    }
    
    sort_col = allowed_sort_fields.get(sort_by, Documents.id)
    query = query.order_by(desc(sort_col) if order == "desc" else asc(sort_col))
    
    documents = db.scalars(query.offset((page - 1) * limit).limit(limit)).all()
    
    return documents


@document_router.get("/document-detail/{id}", response_model=DocumentResponse)
def get_document_detail(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    # Log view activity
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=ActivityAction.VIEW
    )
    
    return document


@document_router.patch("/document/{id}")
def document_rename(
    id: int,
    title: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    old_title = document.title
    document.title = title
    document.updated_at = datetime.now()
    
    db.commit()
    db.refresh(document)
    
    # Log rename activity
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=ActivityAction.RENAME,
        metadata={"old_title": old_title, "new_title": title}
    )
    
    return {"message": "Document title updated successfully"}


@document_router.patch("/document/{id}/favorite")
def document_toggle_favorite(
    id: int,
    is_favorite: bool = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    document.is_favorite = is_favorite
    document.updated_at = datetime.now()
    
    db.commit()
    db.refresh(document)
    
    # Log favorite activity
    action = ActivityAction.FAVORITE if is_favorite else ActivityAction.UNFAVORITE
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=action
    )
    
    return {"message": "Document favorite flag toggled successfully"}


@document_router.patch("/document/{id}/move-collection")
def document_move_collection(
    id: int,
    collection_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    collection = db.query(Collections).filter(
        Collections.id == collection_id,
        Collections.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(404, "Collection not found")
    
    old_collection_id = document.collection_id
    document.collection_id = collection_id
    document.updated_at = datetime.now()
    
    db.commit()
    db.refresh(document)
    
    # Log move activity
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=ActivityAction.MOVE,
        metadata={"old_collection": old_collection_id, "new_collection": collection_id}
    )
    
    return {"message": "Document moved successfully"}


@document_router.delete("/document/{id}")
def document_move_to_trash(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    if document.document_status == DocumentStatus.TRASHED:
        raise HTTPException(400, "Document already in Trash")

    document.document_status = DocumentStatus.TRASHED
    document.deleted_at = datetime.now()
    
    db.commit()
    db.refresh(document)
    
    # Log delete activity
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=ActivityAction.DELETE
    )
    
    return {"message": "Document moved to trash"}


@document_router.patch("/document/{id}/restore")
def document_restore(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    if document.document_status != DocumentStatus.TRASHED:
        raise HTTPException(400, "Document already Active")

    document.document_status = DocumentStatus.ACTIVE
    document.deleted_at = None
    document.updated_at = datetime.now()
    
    db.commit()
    db.refresh(document)
    
    # Log restore activity
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=ActivityAction.RESTORE
    )
    
    return {"message": "Document restored successfully"}


@document_router.delete("/document/{id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def document_permanent_delete(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    if document.document_status != DocumentStatus.TRASHED:
        raise HTTPException(400, "Document is active, can't be deleted permanently.")
    
    db.delete(document)
    db.commit()
    
    return None


@document_router.get("/document/{id}/preview")
def get_document_preview(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    storage_key = document.storage_key
    
    possible_paths = [
        Path(storage_key),
        Path("uploads") / document.stored_filename,
        Path(".") / storage_key,
        Path(__file__).parent.parent.parent / storage_key,
    ]
    
    file_path = None
    for path in possible_paths:
        if path and path.exists():
            file_path = path
            break
    
    if not file_path:
        uploads_dir = Path("uploads")
        if uploads_dir.exists():
            for file in uploads_dir.glob("*"):
                if document.stored_filename in str(file):
                    file_path = file
                    break
    
    if not file_path or not file_path.exists():
        raise HTTPException(404, f"File not found on server")
    
    mime_types = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }
    
    extension = document.extension.lower() if document.extension else ''
    media_type = mime_types.get(extension, 'application/octet-stream')
    
    filename = document.original_filename or f"{document.title}{extension}"
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )


@document_router.get("/document/{id}/download")
def download_document(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        raise HTTPException(404, "Document not found")
    
    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    
    storage_key = document.storage_key
    
    possible_paths = [
        Path(storage_key),
        Path("uploads") / document.stored_filename,
        Path(".") / storage_key,
        Path(__file__).parent.parent.parent / storage_key,
    ]
    
    file_path = None
    for path in possible_paths:
        if path and path.exists():
            file_path = path
            break
    
    if not file_path:
        uploads_dir = Path("uploads")
        if uploads_dir.exists():
            for file in uploads_dir.glob("*"):
                if document.stored_filename in str(file):
                    file_path = file
                    break
    
    if not file_path or not file_path.exists():
        raise HTTPException(404, f"File not found on server")
    
    mime_types = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }
    
    extension = document.extension.lower() if document.extension else ''
    media_type = mime_types.get(extension, 'application/octet-stream')
    
    filename = document.original_filename or f"{document.title}{extension}"
    
    # Log download activity
    log_activity(
        db=db,
        user_id=current_user.id,
        document_id=document.id,
        action=ActivityAction.DOWNLOAD
    )
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@document_router.get("/debug/file/{id}")
def debug_file(id: int, db: Session = Depends(get_db)):
    document = db.query(Documents).filter(Documents.id == id).first()
    
    if not document:
        return {"error": "Document not found"}
    
    storage_key = document.storage_key
    
    paths = {
        "storage_key": storage_key,
        "storage_key_exists": Path(storage_key).exists() if storage_key else False,
        "uploads_stored": Path("uploads") / document.stored_filename if document.stored_filename else None,
        "uploads_stored_exists": (Path("uploads") / document.stored_filename).exists() if document.stored_filename else False,
        "absolute_path": str(Path(storage_key).absolute()) if storage_key else None,
        "cwd": str(Path.cwd()),
    }
    
    return {
        "document": {
            "id": document.id,
            "title": document.title,
            "storage_key": storage_key,
            "stored_filename": document.stored_filename,
        },
        "paths": paths
    }


@document_router.get("/document/{id}/view")
def view_document(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    document = db.query(Documents).filter(Documents.id == id).first()

    if not document:
        raise HTTPException(404, "Document not found")

    if document.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")

    file_path = Path(document.storage_key)
    if not file_path.exists():
        file_path = Path("uploads") / document.stored_filename

    if not file_path.exists():
        raise HTTPException(404, "File not found")

    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = 'application/octet-stream'

    if document.extension.lower() == '.pdf':
        return FileResponse(
            path=str(file_path),
            media_type='application/pdf',
            headers={
                "Content-Disposition": f'inline; filename="{document.original_filename}"',
            }
        )

    return FileResponse(
        path=str(file_path),
        filename=document.original_filename,
        media_type=mime_type,
    )
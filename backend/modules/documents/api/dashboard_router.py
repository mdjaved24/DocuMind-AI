import hashlib
import mimetypes
from fastapi import APIRouter, Depends, Request, status, HTTPException, Query
from fastapi.responses import FileResponse
from modules.documents.models.document import Documents, DocumentStatus, DocumentViews, DocumentActivity, ActivityAction
from core.database.authentication import get_current_user
from core.database.settings import get_db
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import asc, desc, func, or_, select, and_

dashboard_router = APIRouter(prefix="/dashboard/v1", tags=['Dashboard'])


@dashboard_router.get("/storage")
def storage_used(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get total storage usage"""
    documents = db.query(Documents).filter(Documents.user_id == current_user.id).all()
    
    total_files = len(documents) if documents else 0
    total_size = sum(doc.file_size for doc in documents) if documents else 0
    
    return {
        "total_files": total_files,
        "total_size": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2)
    }


@dashboard_router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive dashboard statistics"""
    
    # Total documents
    total_documents = db.query(Documents).filter(
        Documents.user_id == current_user.id
    ).count()
    
    # Active documents
    active_documents = db.query(Documents).filter(
        Documents.user_id == current_user.id,
        Documents.document_status == DocumentStatus.ACTIVE
    ).count()
    
    # Trashed documents
    trashed_documents = db.query(Documents).filter(
        Documents.user_id == current_user.id,
        Documents.document_status == DocumentStatus.TRASHED
    ).count()
    
    # Favorite documents
    favorite_documents = db.query(Documents).filter(
        Documents.user_id == current_user.id,
        Documents.is_favorite == True
    ).count()
    
    # Total file size
    total_size = db.query(func.sum(Documents.file_size)).filter(
        Documents.user_id == current_user.id
    ).scalar() or 0
    
    # Recent uploads (last 7 days)
    seven_days_ago = datetime.now() - timedelta(days=7)
    recent_uploads = db.query(Documents).filter(
        Documents.user_id == current_user.id,
        Documents.created_at >= seven_days_ago
    ).count()
    
    # Activity breakdown
    activities = db.query(
        DocumentActivity.action,
        func.count(DocumentActivity.id).label('count')
    ).filter(
        DocumentActivity.user_id == current_user.id
    ).group_by(DocumentActivity.action).all()
    
    activity_breakdown = {action.value: count for action, count in activities}
    
    return {
        "total_documents": total_documents,
        "active_documents": active_documents,
        "trashed_documents": trashed_documents,
        "favorite_documents": favorite_documents,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "recent_uploads_7days": recent_uploads,
        "activity_breakdown": activity_breakdown
    }


@dashboard_router.get("/recent-activity")
def recent_activity(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recent user activity"""
    
    activities = db.query(
        DocumentActivity,
        Documents.title.label('document_title')
    ).join(
        Documents,
        DocumentActivity.document_id == Documents.id
    ).filter(
        DocumentActivity.user_id == current_user.id
    ).order_by(
        DocumentActivity.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for activity, document_title in activities:
        result.append({
            "id": activity.id,
            "action": activity.action.value,
            "document_id": activity.document_id,
            "document_title": document_title,
            "metadata": activity.activity_metadata,
            "created_at": activity.created_at,
            "time_ago": get_time_ago(activity.created_at)
        })
    
    return result


@dashboard_router.get("/popular-documents")
def popular_documents(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get most viewed/favorited documents"""
    
    # Get documents with view counts
    documents = db.query(
        Documents.id,
        Documents.title,
        Documents.file_size,
        Documents.created_at,
        Documents.is_favorite,
        func.count(DocumentViews.id).label('view_count')
    ).outerjoin(
        DocumentViews,
        Documents.id == DocumentViews.document_id
    ).filter(
        Documents.user_id == current_user.id,
        Documents.document_status == DocumentStatus.ACTIVE
    ).group_by(
        Documents.id
    ).order_by(
        func.count(DocumentViews.id).desc(),
        Documents.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for doc in documents:
        result.append({
            "id": doc.id,
            "title": doc.title,
            "file_size": doc.file_size,
            "created_at": doc.created_at,
            "is_favorite": doc.is_favorite,
            "view_count": doc.view_count or 0,
            "size_mb": round(doc.file_size / (1024 * 1024), 2)
        })
    
    return result


@dashboard_router.get("/file-type-distribution")
def file_type_distribution(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get distribution of file types"""
    
    results = db.query(
        Documents.extension,
        func.count(Documents.id).label('count')
    ).filter(
        Documents.user_id == current_user.id,
        Documents.document_status == DocumentStatus.ACTIVE
    ).group_by(
        Documents.extension
    ).all()
    
    distribution = {}
    for ext, count in results:
        distribution[ext] = count
    
    return {
        "distribution": distribution,
        "total": sum(distribution.values())
    }


@dashboard_router.get("/activity-timeline")
def activity_timeline(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get activity timeline for the last N days"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    # Get daily activity counts
    results = db.query(
        func.date(DocumentActivity.created_at).label('date'),
        func.count(DocumentActivity.id).label('count')
    ).filter(
        DocumentActivity.user_id == current_user.id,
        DocumentActivity.created_at >= start_date
    ).group_by(
        func.date(DocumentActivity.created_at)
    ).order_by(
        func.date(DocumentActivity.created_at)
    ).all()
    
    timeline = []
    for date, count in results:
        timeline.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })
    
    return {
        "days": days,
        "timeline": timeline
    }


@dashboard_router.get("/storage-breakdown")
def storage_breakdown(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get storage breakdown by file type"""
    
    results = db.query(
        Documents.extension,
        func.sum(Documents.file_size).label('total_size'),
        func.count(Documents.id).label('count')
    ).filter(
        Documents.user_id == current_user.id,
        Documents.document_status == DocumentStatus.ACTIVE
    ).group_by(
        Documents.extension
    ).all()
    
    breakdown = []
    for ext, total_size, count in results:
        breakdown.append({
            "extension": ext,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "count": count
        })
    
    # Sort by size descending
    breakdown.sort(key=lambda x: x['total_size_bytes'], reverse=True)
    
    return breakdown


def get_time_ago(dt: datetime) -> str:
    """Format datetime as 'time ago' string"""
    now = datetime.now()
    diff = now - dt
    
    if diff.days > 365:
        years = diff.days // 365
        return f"{years} year{'s' if years > 1 else ''} ago"
    elif diff.days > 30:
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"
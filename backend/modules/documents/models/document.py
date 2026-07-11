from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text, Date, BigInteger, Float, JSON, ForeignKey, BIGINT
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.settings import Base
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy.dialects.postgresql import UUID
import uuid



class DocumentStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    TRASHED = "TRASHED"
    ARCHIVED = "ARCHIVED"


class ProcessingStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    
    

class Documents(Base):
    __tablename__ = "documents"

    __table_args__ = {"schema": "Documents"}

    id = Column(Integer, primary_key=True)

    uuid = Column(UUID(as_uuid=True),default=uuid.uuid4,unique=True,nullable=False)

    user_id = Column(Integer,ForeignKey("Users.users.id"),nullable=False,index=True)

    collection_id = Column(Integer,ForeignKey("Documents.collections.id"),nullable=False,index=True)

    title = Column(String(255), nullable=False)

    original_filename = Column(String(255), nullable=False)

    stored_filename = Column(String(255), nullable=False)

    mime_type = Column(String(100), nullable=False)

    extension = Column(String(20), nullable=False)

    file_size = Column(BigInteger, nullable=False)

    storage_key = Column(Text, nullable=False)

    checksum = Column(String(255), nullable=False)

    page_count = Column(Integer)

    language = Column(String(30))

    is_favorite = Column(Boolean, default=False)

    document_status = Column(Enum(DocumentStatus, name="documentstatus", schema="Documents", create_type=True),default=DocumentStatus.ACTIVE,nullable=False)

    processing_status = Column(Enum(ProcessingStatus, name="processingstatus", schema="Documents", create_type=True),default=ProcessingStatus.PENDING,nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())

    deleted_at = Column(DateTime(timezone=True))   # Soft Delete


    user = relationship("Users",back_populates="documents")

    collection = relationship("Collections",back_populates="documents")
    
    
    def __repr__(self):
        return f'{self.name} | {self.user_id}'
    
    

class DocumentViews(Base):
    __tablename__ = "document_views"
    __table_args__ = {"schema": "Documents"}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer,ForeignKey("Users.users.id"),nullable=False)
    document_id = Column(Integer,ForeignKey("Documents.documents.id"),nullable=False)
    viewed_at = Column(DateTime(timezone=True),server_default=func.now())
    
    
    
class ActivityAction(enum.Enum):
    UPLOAD = "UPLOAD"
    VIEW = "VIEW"
    DOWNLOAD = "DOWNLOAD"
    RENAME = "RENAME"
    MOVE = "MOVE"
    DELETE = "DELETE"
    RESTORE = "RESTORE"
    FAVORITE = "FAVORITE"
    UNFAVORITE = "UNFAVORITE"
    
    
    
class DocumentActivity(Base):
    __tablename__ = "document_activity"
    __table_args__ = {"schema": "Documents"}


    id = Column(Integer, primary_key=True)

    user_id = Column(Integer,ForeignKey("Users.users.id"),nullable=False)

    document_id = Column(Integer,ForeignKey("Documents.documents.id"),nullable=False)

    action = Column(Enum(ActivityAction, name="activityaction",schema="Documents",create_type=True),nullable=False, default=ActivityAction.UPLOAD)

    activity_metadata = Column(JSON)

    created_at = Column(DateTime(timezone=True),server_default=func.now())
    
    
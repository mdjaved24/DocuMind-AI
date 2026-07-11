from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text, Date, BigInteger, Float, JSON, ForeignKey, BIGINT
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.settings import Base
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy.dialects.postgresql import UUID
import uuid


class ProcessingStatus(enum.Enum):
    PENDING = "PENDING"
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    CANCELLED = "CANCELLED"
    
    

class CurrentStage(enum.Enum):
    UPLOAD = "UPLOAD"
    QUEUED = "QUEUED"
    TEXT_EXTRACTION = "TEXT_EXTRACTION"
    CLASSIFICATION = "CLASSIFICATION"
    METADATA_EXTRACTION = "METADATA_EXTRACTION"
    SUMMARY = "SUMMARY"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    INDEXING = "INDEXING"
    COMPLETED = "COMPLETED"
    


class ProcessingJobs(Base):
    __tablename__ = "processing_jobs"
    __table_args__ = {"schema":"AIProcessing"}
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID, index=True)
    document_id = Column(Integer, ForeignKey("Documents.documents.id"), nullable=False, index=True)
    processing_status = Column(
        Enum(
            ProcessingStatus,
            name="processingstatus",
            schema="AIProcessing",
            create_type=True,
        ),
        nullable=False,
        default=ProcessingStatus.PENDING,
    )

    current_stage = Column(
        Enum(
            CurrentStage,
            name="currentstage",
            schema="AIProcessing",
            create_type=True,
        ),
        nullable=False,
        default=CurrentStage.UPLOAD,
    )
    priority = Column(Integer, nullable=True)
    retry_count = Column(Integer, nullable=True, default=0)
    started_at = Column(DateTime, nullable=True, default=datetime.now)
    completed_at = Column(DateTime, nullable=True, default=datetime.now)
    processing_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.now)
    updated_at = Column(DateTime, nullable=True, default=datetime.now)
    
    
    
    
class DocumentClassifications(Base):
    __tablename__ = "document_classifications"
    __table_args__ = {"schema":"AIProcessing"}
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("Documents.documents.id"), nullable=False, index=True)
    document_type = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    model_name = Column(String(255), nullable=False)
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    
    
    
class DocumentExtractions(Base):
    __tablename__ = "document_extractions"
    __table_args__ = {"schema":"AIProcessing"}
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("Documents.documents.id"), nullable=False, index=True)
    extracted_data = Column(JSON)
    confidence_score = Column(Float, nullable=False)
    extraction_version = Column(String(20), nullable=False)
    created_at = Column(DateTime, nullable=True, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now)
    
    

class DocumentSummaries(Base):
    __tablename__ = "document_summaries"
    __table_args__ = {"schema":"AIProcessing"}
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("Documents.documents.id"), nullable=False, index=True)
    summary_type = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    model_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    


class DocumentChunks(Base):
    __tablename__ = "document_chunks"
    __table_args__ = {"schema":"AIProcessing"}
    
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("Documents.documents.id"), nullable=False, index=True)
    chunk_number = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_text = Column(Text, nullable=False)
    embedding_id = Column(UUID)
    token_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    
    

class AgentExecutionLogs(Base):
    __tablename__ = "agent_execution_logs"
    __table_args__ = {"schema":"AIProcessing"}
    
    
    id = Column(Integer, primary_key=True, index=True)
    processing_job_id = Column(Integer, ForeignKey("AIProcessing.processing_jobs.id"))
    agent_name = Column(String(255), nullable=False)
    model_name = Column(String(255), nullable=False)
    status = Column(
        Enum(
            ProcessingStatus,
            name="status",
            schema="AIProcessing",
            create_type=True,
        ),
        nullable=False,
        default=ProcessingStatus.PENDING,
    )

    stage = Column(
        Enum(
            CurrentStage,
            name="stage",
            schema="AIProcessing",
            create_type=True,
        ),
        nullable=False,
        default=CurrentStage.UPLOAD,
    )
    input_tokens = Column(Integer, nullable=False)
    output_tokens = Column(Integer, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.now)
    
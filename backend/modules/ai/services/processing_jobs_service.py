from datetime import datetime
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session

from modules.ai.models.ai_models import (
    ProcessingJobs,
    ProcessingStatus,
    CurrentStage,
)


class ProcessingService:

    # ================================== CREATE JOB ============================
    @staticmethod
    def create_job(db: Session, document_id: int):

        # Check if an active job already exists
        active_job = (
            db.query(ProcessingJobs)
            .filter(
                ProcessingJobs.document_id == document_id,
                ProcessingJobs.processing_status.in_(
                    [
                        ProcessingStatus.PENDING,
                        ProcessingStatus.QUEUED,
                        ProcessingStatus.PROCESSING,
                    ]
                ),
            )
            .first()
        )

        if active_job:
            return active_job

        job = ProcessingJobs(
            uuid=uuid.uuid4(),
            document_id=document_id,
            processing_status=ProcessingStatus.PENDING,
            current_stage=CurrentStage.UPLOAD,
        )

        db.add(job)
        db.flush()        # Don't commit here

        return job
    
    
    # =============================== GET JOb Helper function ================================
    
    @staticmethod
    def get_job_or_raise(db:Session, job_id:int):
        job = db.query(ProcessingJobs).filter(ProcessingJobs.id==job_id).first()
        if not job:
            raise HTTPException(404, "Processing job not found")
        
        return job
    
    
    # =================================== GET PENDING JOBS =====================================
    @staticmethod
    def get_pending_jobs(db:Session):
        jobs = db.query(ProcessingJobs).filter(ProcessingJobs.processing_status == ProcessingStatus.PENDING).order_by(ProcessingJobs.created_at.asc()).all()
        
        return jobs
        
    # =================================== START JOB ========================================
    
    @staticmethod
    def start_job(db:Session, job_id:int):
        job = ProcessingService.get_job_or_raise(db, job_id)
        
        if job.processing_status != ProcessingStatus.PENDING:
            raise HTTPException(400, "Job is not in PENDING state")
        
        job.processing_status = ProcessingStatus.PROCESSING
        job.current_stage = CurrentStage.TEXT_EXTRACTION
        job.started_at = datetime.now()
        db.commit()
        db.refresh(job)
        
        return job
    
    
    # ============================== UPDATE STATE ==========================
    @staticmethod
    def update_job(db:Session,job_id:int, stage:CurrentStage):
        job = ProcessingService.get_job_or_raise(db, job_id)
        
        job.current_stage = stage
        db.commit()
        db.refresh()
        
        return job
    
    # ============================== MARK COMPLETED ===========================
    @staticmethod
    def mark_completed(db:Session, job_id:int):
        job = ProcessingService.get_job_or_raise(db, job_id)
        
        job.processing_status = ProcessingStatus.COMPLETED
        job.current_stage = CurrentStage.COMPLETED
        job.completed_at = datetime.now()
        
        if job.started_at:
            processing_time = (job.completed_at - job.started_at).total_seconds()
            
            job.processing_time_ms = int(processing_time*1000)
            
        db.commit()
        db.refresh(job)
        
        return job
    
    
    # =============================== MARK FAILED ===============================
    @staticmethod
    def mark_failed(db:Session, job_id:int, error_message:str):
        job = ProcessingService.get_job_or_raise(db, job_id)
        
        job.processing_status = ProcessingStatus.FAILED
        job.error_message = error_message

            
        db.commit()
        db.refresh(job)
        
        return job
    
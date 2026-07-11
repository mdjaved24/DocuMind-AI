from datetime import datetime
import uuid

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from modules.documents.models.document import (
    Documents,
    DocumentStatus,
    ProcessingStatus,
    ActivityAction,
)

from modules.documents.models.collection import Collections

from modules.documents.services.file_service import FileService
from modules.documents.services.activity_service import ActivityService

from modules.ai.services.processing_jobs_service import ProcessingService

from core.logging.logger import log_document_event


class DocumentService:

    @staticmethod
    async def upload_document(
        db: Session,
        current_user,
        title: str,
        file: UploadFile,
        collection_id: int,
        is_favorite: bool,
        upload_dir,
        allowed_extensions,
        max_file_size,
    ):
        try:

            # ---------------------------------------
            # Validate Collection
            # ---------------------------------------

            collection = (
                db.query(Collections)
                .filter(
                    Collections.id == collection_id,
                    Collections.user_id == current_user.id
                )
                .first()
            )

            if not collection:
                raise HTTPException(
                    status_code=404,
                    detail="Collection not found"
                )

            # ---------------------------------------
            # Process File
            # ---------------------------------------

            file_info = await FileService.process_upload(
                file=file,
                upload_dir=upload_dir,
                allowed_extensions=allowed_extensions,
                max_file_size=max_file_size
            )

            # ---------------------------------------
            # Duplicate Check
            # ---------------------------------------

            duplicate = (
                db.query(Documents)
                .filter(
                    Documents.user_id == current_user.id,
                    Documents.checksum == file_info["checksum"]
                )
                .first()
            )

            if duplicate:
                raise HTTPException(
                    status_code=409,
                    detail="Document already exists."
                )

            # ---------------------------------------
            # Create Document
            # ---------------------------------------

            document = Documents(

                uuid=uuid.uuid4(),

                user_id=current_user.id,

                collection_id=collection_id,

                title=title,

                original_filename=file_info["original_filename"],

                stored_filename=file_info["stored_filename"],

                mime_type=file_info["mime_type"],

                extension=file_info["extension"],

                file_size=file_info["file_size"],

                storage_key=file_info["storage_key"],

                checksum=file_info["checksum"],

                is_favorite=is_favorite,

                document_status=DocumentStatus.ACTIVE,

                processing_status=ProcessingStatus.PENDING,
            )

            db.add(document)

            db.flush()

            db.refresh(document)

            # ---------------------------------------
            # Create Processing Job
            # ---------------------------------------

            processing_job = ProcessingService.create_job(
                db=db,
                document_id=document.id
            )

            # ---------------------------------------
            # Activity
            # ---------------------------------------

            ActivityService.create_activity(
                db=db,
                user_id=current_user.id,
                document_id=document.id,
                action=ActivityAction.UPLOAD,
                metadata={
                    "title": title,
                    "extension": file_info["extension"],
                    "size": file_info["file_size"],
                },
            )

            # ---------------------------------------
            # Logger
            # ---------------------------------------

            log_document_event(
                event_type="DOCUMENT_UPLOAD",
                document_id=str(document.uuid),
                document_title=document.title,
                user_id=str(current_user.id),
                email=current_user.email,
                action="UPLOAD",
                details={
                    "collection_id": collection_id,
                    "file_size": file_info["file_size"],
                },
            )

            # ---------------------------------------
            # Commit Transaction
            # ---------------------------------------

            db.commit()

            db.refresh(document)

            return {
                "document_uuid": document.uuid,
                "processing_job_uuid": processing_job.uuid,
                "title": document.title,
                "status": document.document_status.value,
                "processing_status": processing_job.processing_status.value,
                "uploaded_time": document.created_at,
            }
        
        except Exception:
            db.rollback()
            raise
        
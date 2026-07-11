from pathlib import Path
import hashlib
import uuid

from fastapi import HTTPException, UploadFile


class FileService:

    @staticmethod
    async def process_upload(
        file: UploadFile,
        upload_dir: Path,
        allowed_extensions: list,
        max_file_size: int
    ):

        # Validate Extension
        extension = Path(file.filename).suffix.lower()

        if extension not in allowed_extensions:
            raise HTTPException(
                status_code=415,
                detail=f"Allowed extensions: {allowed_extensions}"
            )

        # Read File
        content = await file.read()

        file_size = len(content)

        # Validate Size
        if file_size > max_file_size * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"Maximum allowed size is {max_file_size} MB"
            )

        # Generate Checksum
        checksum = hashlib.sha256(content).hexdigest()

        # Generate Stored Filename
        stored_filename = f"{uuid.uuid4()}{extension}"

        # Storage Key
        storage_key = Path("uploads", stored_filename).as_posix()

        # Save File
        file_path = upload_dir / stored_filename

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        return {

            "original_filename": file.filename,

            "stored_filename": stored_filename,

            "extension": extension,

            "mime_type": file.content_type,

            "file_size": file_size,

            "checksum": checksum,

            "storage_key": storage_key

        }
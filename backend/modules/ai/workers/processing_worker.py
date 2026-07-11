import time
from core.database.settings import SessionLocal

from modules.ai.services.processing_jobs_service import ProcessingService
# Register all models
import core.database.models


def start_worker():
    print("="*50)
    print("Worker Started")
    
    while True:
        db=SessionLocal()
        
        try:
            jobs = ProcessingService.get_pending_jobs(db)
            
            if jobs:
                job = jobs[0]
                print(f"Processing Job: {job.id}")
                
                ProcessingService.start_job(db, job.id)
                
                # Simulate OCR
                time.sleep(3)
                
                ProcessingService.mark_completed(db, job.id)
                
                print(f"Completed Job: {job.id}")
                
            else:
                print("No Pending Jobs. Sleeping...")
                time.sleep(5)
        
        except Exception as e:
            print(e)
            
        
        finally:
            db.close()
            
    

if __name__=="__main__":
    start_worker()                
            
from fastapi import FastAPI
from dotenv import load_dotenv
import os

from fastapi.staticfiles import StaticFiles
from modules.users.api.users_api import user_router
from modules.users.api.user_auth import user_auth_router
from modules.documents.api.collection_router import collection_router
from modules.documents.api.dashboard_router import dashboard_router
from modules.documents.api.document_router import document_router
from core.database.settings import init_db
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware

from modules.users.models.UserModel import Users, RefreshTokens

from modules.documents.models.collection import Collections

from modules.documents.models.document import (
    Documents,
    DocumentViews,
    DocumentActivity,
)

from modules.ai.models.ai_models import (
    ProcessingJobs,
    DocumentClassifications,
    DocumentChunks,
    DocumentExtractions,
    DocumentSummaries,
    AgentExecutionLogs
)



app = FastAPI()

load_dotenv()

init_db()


DB_URL = os.getenv("DATABASE_URL")

# Custom middleware to add CORS headers to static files
class StaticFilesCorsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/uploads"):
            response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
            response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
            response.headers["Access-Control-Expose-Headers"] = "Content-Disposition, Content-Type, Content-Length"
        return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add custom CORS middleware for static files
app.add_middleware(StaticFilesCorsMiddleware)

# Mount static files AFTER CORS middleware
app.mount("/uploads", StaticFiles(directory="uploads", check_dir=False), name="uploads")




app.include_router(user_router)
app.include_router(user_auth_router)
app.include_router(collection_router)
app.include_router(document_router)
app.include_router(dashboard_router)


@app.get("/health")
def health_check():
    return "Running: Healthy"





if __name__ == "__main__":
    import uvicorn 
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
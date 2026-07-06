from fastapi import FastAPI
from dotenv import load_dotenv
import os
from modules.users.api.users_api import user_router
from modules.users.api.user_auth import user_auth_router
from core.database.settings import init_db

app = FastAPI()

load_dotenv()

init_db()


DB_URL = os.getenv("DATABASE_URL")

print(DB_URL)

app.include_router(user_router)
app.include_router(user_auth_router)


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
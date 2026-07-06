from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker as async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from sqlalchemy import event

load_dotenv()

USER=os.getenv("POSTGRES_USER")
PASSWORD=os.getenv("POSTGRES_PASSWORD")
SERVER=os.getenv("POSTGRES_SERVER")
PORT=os.getenv("POSTGRES_PORT")
DATABASE=os.getenv("POSTGRES_DB")

DB_ECHO=os.getenv("DB_ECHO","False").lower() == "true"


def get_db_url(username, password, server, port, database) -> str:
    """Get database URL"""
    return f'postgresql://{username}:{password}@{server}:{port}/{database}'


def get_async_db_url(username: str, password: str, server: str, port: str, database: str) -> str:
    """Generate asynchronous database URL"""
    return f'postgresql+asyncpg://{username}:{password}@{server}:{port}/{database}'


# Database URLs
DATABASE_URL = get_db_url(USER, PASSWORD, SERVER, PORT, DATABASE)
ASYNC_DATABASE_URL = get_async_db_url(USER, PASSWORD, SERVER, PORT, DATABASE)


# Synchronous engine (for migrations and synchronous operations)
engine = create_engine(
    DATABASE_URL,
    echo=DB_ECHO,  # Set to False in production
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connection before using
    pool_recycle=3600,   # Recycle connections after 1 hour
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Asynchronous engine (for async endpoints)
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=DB_ECHO,  # Set to False in production
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)


AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


Base=declarative_base()


# Synchronous database dependency
def get_db() -> Generator:
    """
    Dependency for getting synchronous database session.
    Use this for non-async endpoints or when you need synchronous operations.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# Optional: Function to initialize database
def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

    
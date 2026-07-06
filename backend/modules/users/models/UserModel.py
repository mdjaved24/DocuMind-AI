from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text, Date, BigInteger, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.settings import Base
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Users(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "Users"}
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True),default=uuid.uuid4,unique=True,nullable=False)
    full_name = Column(String(50), nullable=False)
    email = Column(String(50), nullable=False, unique=True, index=True)
    password_hash = Column(Text, nullable=False)
    phone_no = Column(String(20), nullable=False)
    profile_image = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=True)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete
    
    refresh_tokens = relationship("RefreshTokens",back_populates="user",cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User: {self.full_name} | {self.email}>"
    
    

class RefreshTokens(Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = {"schema": "Users"}
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.users.id"), nullable=False)
    token_hash = Column(String(255))
    expires_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True),server_default=func.now())
    revoked_at = Column(DateTime)
    
    user = relationship("Users", back_populates="refresh_tokens")
    
    def __repr__(self):
        return f"<Token: {self.user_id} | {self.token_hash}>"
    

    
    
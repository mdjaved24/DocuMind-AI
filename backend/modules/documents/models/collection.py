from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text, Date, BigInteger, Float, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.settings import Base
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Collections(Base):
    __tablename__ = "collections"

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_collection"),
        {"schema": "Documents"},
    )

    id = Column(Integer, primary_key=True)

    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)

    user_id = Column(Integer,ForeignKey("Users.users.id"),nullable=False,index=True)

    name = Column(String(100), nullable=False)
    description = Column(Text)

    color = Column(String(20))
    icon = Column(String(50))

    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    user = relationship("Users",back_populates="collections")

    documents = relationship("Documents",back_populates="collection",cascade="all, delete-orphan")
    
    
    def __repr__(self):
        return f'{self.name} | {self.user_id}'


    
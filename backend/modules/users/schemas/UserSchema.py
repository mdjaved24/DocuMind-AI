from pydantic import BaseModel, EmailStr, Field, validator, HttpUrl
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class UserCreate(BaseModel):
    """User create schema"""
    full_name:str
    email:EmailStr
    password:str
    phone_no:str
    is_active:Optional[bool]
    profile_image:Optional[str]=None
    
    
class UserUpdate(BaseModel):
    """User create schema"""
    full_name:Optional[str] = None
    email:Optional[EmailStr] = None
    password:Optional[str] = None
    phone_no:Optional[str] = None
    is_active:Optional[bool] = None
    profile_image:Optional[str] = None
    
    
    
class UserResponse(BaseModel):
    """"User response"""
    id:int
    full_name:str
    email:EmailStr
    phone_no:str
    profile_image:str
    password_hash:str
    is_active:bool
    email_verified:bool
    last_login_at:Optional[datetime]
    created_at:Optional[datetime]
    updated_at:Optional[datetime]
    deleted_at:Optional[datetime]
    
    

class VerifyOTPRequest(BaseModel):
    """Verify OTP"""
    email:EmailStr
    otp:str
    
    
class UserRegistration(BaseModel):
    """User create schema"""
    full_name:str
    email:EmailStr
    password:str
    phone_no:str
    profile_image:Optional[str]=""
    is_active:Optional[bool]=True

    
    
    
class LoginRequest(BaseModel):
    """Login Schema"""
    email:EmailStr
    password:str
    
    
class LoginwithOTPRequest(BaseModel):
    email:EmailStr
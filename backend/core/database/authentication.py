from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import secrets
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from modules.users.models.UserModel import Users
from core.database.settings import get_db


load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


BCRYPT_ROUNDS = 12
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
SECRET_KEY = os.getenv("SECRET_KEY", "unknown")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password:str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password:str, hashed_password:str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)




#================JWT Functions==========================

def create_access_token(data:Dict[str, Any], expires_delta:Optional[timedelta]=None) -> str:
    """Create a JWT Access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp":expire, "type":"access"})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_token(token:str) -> str:
    """Decode a JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return {}
    
    
def create_email_verification_token(email:str) -> str:
    """Create a Email verification token"""
    data = {"email":email, "type":"verify"}
    expire = datetime.utcnow() + timedelta(hours=24)
    data.update({"exp":expire})
    return jwt.decode(data, SECRET_KEY, algorithm=ALGORITHM)


def create_password_reset_token(email:str) -> str:
    """Create a password reset token"""
    data = {"email":email, "type":"reset"}
    expire = datetime.utcnow() + timedelta(hours=24)
    data.update({"exp":expire})
    return jwt.decode(data, SECRET_KEY, algorithm=ALGORITHM)
        
        
def generate_random_token() -> str:
    """Generate a random token for various purposes"""
    return secrets.token_urlsafe(32)
        
        
        
# ===========Get Current User=============================================================        
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Invalid authentication credentials',
        headers={'WWW-Authenticate': 'Bearer'}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uuid: str = payload.get('sub')

        if uuid is None:
            raise credential_exception

    except JWTError:
        raise credential_exception

    # ✅ Fetch user from DB using UUID
    user = db.query(Users).filter(Users.uuid == uuid).first()

    if user is None:
        raise credential_exception

    return user
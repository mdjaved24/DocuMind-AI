import json
from core.database.redis import redis_client
from fastapi import APIRouter, HTTPException
from core.database.authentication import verify_password, get_password_hash, pwd_context, create_access_token
from modules.users.schemas.UserSchema import UserRegistration
from modules.users.models.UserModel import Users
from modules.users.services.email_service import email_service

from fastapi import APIRouter, Depends, status, Response, HTTPException
from modules.users.schemas.UserSchema import UserCreate, UserResponse, UserUpdate, VerifyOTPRequest, LoginRequest, LoginwithOTPRequest
from modules.users.models.UserModel import Users
import random
from core.database.settings import get_db
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session



user_auth_router = APIRouter(prefix="/user/auth")



@user_auth_router.post("/signup")
def signup(request:UserRegistration, db:Session=Depends(get_db)):
    
    request.email = request.email.lower()
    
    user = db.query(Users).filter_by(email=request.email).first()
    
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    
    otp = random.randrange(100000, 999999)
    
    password_hash = get_password_hash(request.password)
    
    signup_data = {
        "uuid":uuid.uuid4().hex,
        "full_name":request.full_name,
        "email":request.email,
        "password_hash":password_hash,
        "phone_no":request.phone_no,
        "profile_image":request.profile_image or "",
        "is_active":request.is_active if request.is_active is not None else True,
    }
    
    signup_data["otp_hash"] = pwd_context.hash(str(otp))

    key = f"signup:{request.email}"
    
    redis_client.setex(
        key,
        600,
        json.dumps(signup_data)
    )

    email_service.send_otp_email(request.email, otp)
    print("OTP =", otp)
    
    return {
        "message": "OTP sent successfully."
    }
    
    
@user_auth_router.post("/verify-signup-otp", status_code=status.HTTP_200_OK)
def verify_signup_otp(request:VerifyOTPRequest, db:Session=Depends(get_db)):
    data = redis_client.get(f"signup:{request.email}")
    
    if not data:
        raise HTTPException(
            400,
            "OTP expired."
        )
        
    signup_data = json.loads(data)
    
    if not pwd_context.verify(request.otp, signup_data["otp_hash"]):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    
    new_User = Users(
        uuid=signup_data["uuid"],
        full_name=signup_data["full_name"],
        email=signup_data["email"],
        password_hash=signup_data["password_hash"],
        phone_no=signup_data["phone_no"],
        profile_image=signup_data["profile_image"],
        is_active=signup_data["is_active"],
        email_verified=True
    )
    
    db.add(new_User)
    db.commit()
    db.refresh(new_User)
    
    return {"message":"OTP Verified successfully"}



@user_auth_router.post("/login", status_code=status.HTTP_200_OK)
def login(request:LoginRequest, db:Session=Depends(get_db)):
    user = db.query(Users).filter_by(email=request.email).first()
    if not user:
        raise HTTPException(404, "User Not Found")
    
    if not user.is_active:
        raise HTTPException(400, "User is in-active. Kindly contact the admin!")
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(400, "Invalid user credentials")
    
    access_token = create_access_token(
        data={'sub':str(user.uuid)}
        )
    
    return {"msg":"Login Successful","token":access_token}



@user_auth_router.post("/login-with-otp", status_code=status.HTTP_200_OK)
def login_with_otp(request:LoginwithOTPRequest, db:Session=Depends(get_db)):
    user = db.query(Users).filter_by(email=request.email).first()
    if not user:
        raise HTTPException(404, "User Not Found")
    
    otp = random.randrange(100000, 999999)
    
    
    login_data = {
        "uuid":user.uuid,
        "email":request.email,
        "otp_hash":pwd_context.hash(str(otp))
    }
    
    key = f"login:{request.email}"
    
    redis_client.setex(
        key,
        600,
        json.dumps(login_data)
    )
    
    email_service.send_otp_email(request.email, otp)
    print("OTP =", otp)
    
    return {
        "message": "OTP sent successfully."
    }
    

@user_auth_router.post("/verify-login-otp", status_code=status.HTTP_200_OK)
def verify_login_otp(request:VerifyOTPRequest, db:Session=Depends(get_db)):
    data = redis_client.get(f"login:{request.email}")
    
    if not data:
        raise HTTPException(
            400,
            "OTP expired."
        )
        
    login_data = json.loads(data)
    
    if not pwd_context.verify(request.otp, login_data["otp_hash"]):
        raise HTTPException(status_code=400, detail="Invalid OTP")


    access_token = create_access_token(
        data={'sub':login_data['uuid']}
        )
    
    return {"msg":"Login Successful","token":access_token}

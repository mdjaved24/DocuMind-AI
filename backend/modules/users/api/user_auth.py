import json
from core.database.redis import redis_client
from fastapi import APIRouter, HTTPException, Request
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

# Import logging utilities
from core.logging.logger import log_auth_event, log_security_event, log_audit_event


user_auth_router = APIRouter(prefix="/user/auth")


@user_auth_router.post("/signup")
def signup(
    request: UserRegistration,
    req: Request,
    db: Session = Depends(get_db)
):
    # Get client info
    client_ip = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("user-agent", "unknown")
    
    request.email = request.email.lower()
    
    # Check if user exists
    user = db.query(Users).filter_by(email=request.email).first()
    
    if user:
        # Log failed registration attempt
        log_auth_event(
            event_type="SIGNUP_ATTEMPT",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "User already exists"},
            error="User already exists"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    otp = random.randrange(100000, 999999)
    password_hash = get_password_hash(request.password)
    
    signup_data = {
        "uuid": uuid.uuid4().hex,
        "full_name": request.full_name,
        "email": request.email,
        "password_hash": password_hash,
        "phone_no": request.phone_no,
        "profile_image": request.profile_image or "",
        "is_active": request.is_active if request.is_active is not None else True,
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
    
    # Log successful OTP sent
    log_auth_event(
        event_type="SIGNUP_OTP_SENT",
        email=request.email,
        status="SUCCESS",
        ip_address=client_ip,
        user_agent=user_agent,
        details={"otp_sent": True}
    )
    
    return {
        "message": "OTP sent successfully."
    }
    
    
@user_auth_router.post("/verify-signup-otp", status_code=status.HTTP_200_OK)
def verify_signup_otp(
    request: VerifyOTPRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    client_ip = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("user-agent", "unknown")
    
    data = redis_client.get(f"signup:{request.email}")
    
    if not data:
        # Log OTP expired
        log_auth_event(
            event_type="SIGNUP_OTP_VERIFY",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "OTP expired"},
            error="OTP expired"
        )
        raise HTTPException(400, "OTP expired.")
        
    signup_data = json.loads(data)
    
    if not pwd_context.verify(request.otp, signup_data["otp_hash"]):
        # Log invalid OTP attempt
        log_auth_event(
            event_type="SIGNUP_OTP_VERIFY",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "Invalid OTP"},
            error="Invalid OTP"
        )
        
        # Track invalid OTP attempts for security
        log_security_event(
            event_type="INVALID_OTP_ATTEMPT",
            email=request.email,
            severity="LOW",
            ip_address=client_ip,
            details={"attempt_type": "signup"}
        )
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Create new user
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
    
    # Log successful registration
    log_auth_event(
        event_type="SIGNUP_SUCCESS",
        email=request.email,
        status="SUCCESS",
        ip_address=client_ip,
        user_agent=user_agent,
        details={"user_id": str(new_User.uuid)}
    )
    
    # Log audit event
    log_audit_event(
        user_id=str(new_User.uuid),
        email=request.email,
        action="USER_REGISTERED",
        resource="user",
        details={
            "full_name": new_User.full_name,
            "phone_no": new_User.phone_no
        }
    )
    
    return {"message": "OTP Verified successfully"}


@user_auth_router.post("/login", status_code=status.HTTP_200_OK)
def login(
    request: LoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    client_ip = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("user-agent", "unknown")
    
    user = db.query(Users).filter_by(email=request.email).first()
    
    if not user:
        # Log user not found
        log_auth_event(
            event_type="LOGIN_ATTEMPT",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "User not found"},
            error="User Not Found"
        )
        raise HTTPException(404, "User Not Found")
    
    if not user.is_active:
        # Log inactive user attempt
        log_auth_event(
            event_type="LOGIN_ATTEMPT",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "User inactive"},
            error="User is inactive"
        )
        raise HTTPException(400, "User is in-active. Kindly contact the admin!")
    
    if not verify_password(request.password, user.password_hash):
        # Log failed password attempt
        log_auth_event(
            event_type="LOGIN_ATTEMPT",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "Invalid password"},
            error="Invalid user credentials"
        )
        
        # Track failed login attempts for security
        log_security_event(
            event_type="FAILED_LOGIN_ATTEMPT",
            email=request.email,
            severity="LOW",
            ip_address=client_ip,
            details={"attempt_count": 1}
        )
        raise HTTPException(400, "Invalid user credentials")
    
    access_token = create_access_token(
        data={'sub': str(user.uuid)}
    )
    
    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    
    # Log successful login
    log_auth_event(
        event_type="LOGIN_SUCCESS",
        email=request.email,
        status="SUCCESS",
        ip_address=client_ip,
        user_agent=user_agent,
        details={"user_id": str(user.uuid)}
    )
    
    # Log audit event
    log_audit_event(
        user_id=str(user.uuid),
        email=request.email,
        action="USER_LOGIN",
        resource="user",
        details={"login_method": "password"}
    )
    
    return {"msg": "Login Successful", "token": access_token}


@user_auth_router.post("/login-with-otp", status_code=status.HTTP_200_OK)
def login_with_otp(
    request: LoginwithOTPRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    client_ip = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("user-agent", "unknown")
    
    user = db.query(Users).filter_by(email=request.email).first()
    
    if not user:
        log_auth_event(
            event_type="LOGIN_OTP_REQUEST",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "User not found"},
            error="User Not Found"
        )
        raise HTTPException(404, "User Not Found")
    
    otp = random.randrange(100000, 999999)
    
    login_data = {
        "uuid": str(user.uuid),
        "email": request.email,
        "otp_hash": pwd_context.hash(str(otp))
    }
    
    key = f"login:{request.email}"
    
    redis_client.setex(
        key,
        600,
        json.dumps(login_data)
    )
    
    email_service.send_otp_email(request.email, otp)
    print("OTP =", otp)
    
    # Log OTP sent
    log_auth_event(
        event_type="LOGIN_OTP_SENT",
        email=request.email,
        status="SUCCESS",
        ip_address=client_ip,
        user_agent=user_agent,
        details={"user_id": str(user.uuid)}
    )
    
    return {
        "message": "OTP sent successfully."
    }
    

@user_auth_router.post("/verify-login-otp", status_code=status.HTTP_200_OK)
def verify_login_otp(
    request: VerifyOTPRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    client_ip = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("user-agent", "unknown")
    
    data = redis_client.get(f"login:{request.email}")
    
    if not data:
        log_auth_event(
            event_type="LOGIN_OTP_VERIFY",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "OTP expired"},
            error="OTP expired"
        )
        raise HTTPException(400, "OTP expired.")
        
    login_data = json.loads(data)
    
    if not pwd_context.verify(request.otp, login_data["otp_hash"]):
        # Log invalid OTP attempt
        log_auth_event(
            event_type="LOGIN_OTP_VERIFY",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": "Invalid OTP"},
            error="Invalid OTP"
        )
        
        log_security_event(
            event_type="INVALID_OTP_ATTEMPT",
            email=request.email,
            severity="LOW",
            ip_address=client_ip,
            details={"attempt_type": "login"}
        )
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Get user for last login update
    user = db.query(Users).filter_by(email=request.email).first()
    if user:
        user.last_login_at = datetime.now(timezone.utc)
        db.commit()

    access_token = create_access_token(
        data={'sub': login_data['uuid']}
    )
    
    # Log successful OTP login
    log_auth_event(
        event_type="LOGIN_OTP_SUCCESS",
        email=request.email,
        status="SUCCESS",
        ip_address=client_ip,
        user_agent=user_agent,
        details={"user_id": login_data['uuid']}
    )
    
    log_audit_event(
        user_id=login_data['uuid'],
        email=request.email,
        action="USER_LOGIN",
        resource="user",
        details={"login_method": "otp"}
    )
    
    return {"msg": "Login Successful", "token": access_token}
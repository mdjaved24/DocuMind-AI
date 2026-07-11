from fastapi import APIRouter, Depends, status, Response, HTTPException, Request
from modules.users.schemas.UserSchema import UserCreate, UserResponse, UserUpdate
from modules.users.models.UserModel import Users
from core.database.authentication import get_password_hash, create_access_token, get_current_user
from core.database.settings import get_db
import uuid
from sqlalchemy.orm import Session
from typing import List

# Import logging utilities
from core.logging.logger import log_user_event, log_audit_event, log_security_event, get_client_info


user_router = APIRouter(prefix="/users")


def get_user_by_id(id: int, db: Session):
    return db.query(Users).filter(Users.id == id).first()


@user_router.get("/v1/get-all-users", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
def get_all_users(
    req: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    client_ip, user_agent = get_client_info(req)
    
    users = db.query(Users).order_by(Users.created_at.desc()).all()
    
    # Log user list access
    log_user_event(
        event_type="USER_LIST_ACCESS",
        user_id=str(current_user.uuid) if current_user else None,
        email=current_user.email if current_user else None,
        status="SUCCESS",
        ip_address=client_ip,
        details={"users_count": len(users)}
    )
    
    log_audit_event(
        user_id=str(current_user.uuid) if current_user else None,
        email=current_user.email if current_user else None,
        action="VIEW_USERS",
        resource="users",
        details={"users_count": len(users)}
    )
    
    return users


@user_router.get("/v1/getUser/{id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user(
    id: int,
    req: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    client_ip, user_agent = get_client_info(req)
    
    user = db.query(Users).filter_by(id=id).first()
    
    if not user:
        log_user_event(
            event_type="USER_GET",
            user_id=str(id),
            status="FAILED",
            ip_address=client_ip,
            details={"reason": "User not found"},
            error="User not found"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    log_user_event(
        event_type="USER_GET",
        user_id=str(user.uuid),
        email=user.email,
        status="SUCCESS",
        ip_address=client_ip,
        details={"requested_by": str(current_user.uuid)}
    )
    
    log_audit_event(
        user_id=str(user.uuid),
        email=user.email,
        action="VIEW_USER",
        resource="user",
        details={"viewed_by": current_user.email}
    )
    
    return user


@user_router.post("/v1/addUser", status_code=status.HTTP_201_CREATED)
def add_user(
    request: UserCreate,
    req: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    client_ip, user_agent = get_client_info(req)
    
    # Check if user already exists
    existing_user = db.query(Users).filter_by(email=request.email).first()
    if existing_user:
        log_user_event(
            event_type="USER_CREATE",
            email=request.email,
            status="FAILED",
            ip_address=client_ip,
            details={"reason": "Email already exists"},
            error="Email already exists"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    password = request.password
    password_hash = get_password_hash(password)
    
    profile_image_url = request.profile_image if request.profile_image else ""
    is_active = request.is_active if request.is_active is not None else True
    
    new_user = Users(
        uuid=uuid.uuid4(),
        full_name=request.full_name,
        email=request.email,
        password_hash=password_hash,
        phone_no=request.phone_no,
        profile_image=profile_image_url,
        is_active=is_active
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log user creation
    log_user_event(
        event_type="USER_CREATE",
        user_id=str(new_user.uuid),
        email=new_user.email,
        status="SUCCESS",
        ip_address=client_ip,
        admin_id=str(current_user.uuid) if current_user else None,
        details={
            "full_name": new_user.full_name,
            "phone_no": new_user.phone_no,
            "is_active": new_user.is_active
        }
    )
    
    log_audit_event(
        user_id=str(new_user.uuid),
        email=new_user.email,
        action="USER_CREATED",
        resource="user",
        details={
            "created_by": current_user.email if current_user else "system",
            "full_name": new_user.full_name
        }
    )
    
    return {"msg": "User created successfully"}


@user_router.patch("/v1/updateUser/{id}", status_code=status.HTTP_200_OK)
def update_user(
    id: int,
    request: UserUpdate,
    req: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    client_ip, user_agent = get_client_info(req)
    
    user = get_user_by_id(id, db)
    if not user:
        log_user_event(
            event_type="USER_UPDATE",
            user_id=str(id),
            status="FAILED",
            ip_address=client_ip,
            details={"reason": "User not found"},
            error="User not found"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_data = request.model_dump(exclude_unset=True)
    old_data = {
        "full_name": user.full_name,
        "email": user.email,
        "phone_no": user.phone_no,
        "is_active": user.is_active,
        "profile_image": user.profile_image
    }
    
    # Check if email is being changed and if it's already taken
    if "email" in update_data and update_data["email"] != user.email:
        existing_user = db.query(Users).filter_by(email=update_data["email"]).first()
        if existing_user and existing_user.id != id:
            log_user_event(
                event_type="USER_UPDATE",
                user_id=str(user.uuid),
                email=user.email,
                status="FAILED",
                ip_address=client_ip,
                details={"reason": "Email already exists"},
                error="Email already exists"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
    
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    # Log user update
    log_user_event(
        event_type="USER_UPDATE",
        user_id=str(user.uuid),
        email=user.email,
        status="SUCCESS",
        ip_address=client_ip,
        admin_id=str(current_user.uuid) if current_user else None,
        details={
            "updated_fields": list(update_data.keys()),
            "old_data": old_data,
            "new_data": {
                key: getattr(user, key) for key in update_data.keys()
            }
        }
    )
    
    log_audit_event(
        user_id=str(user.uuid),
        email=user.email,
        action="USER_UPDATED",
        resource="user",
        details={
            "updated_by": current_user.email if current_user else "system",
            "updated_fields": list(update_data.keys())
        }
    )
    
    return {"msg": "User data updated"}


@user_router.delete("/v1/deleteUser/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    id: int,
    req: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    client_ip, user_agent = get_client_info(req)
    
    user = get_user_by_id(id, db)
    if not user:
        log_user_event(
            event_type="USER_DELETE",
            user_id=str(id),
            status="FAILED",
            ip_address=client_ip,
            details={"reason": "User not found"},
            error="User not found"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if current_user and current_user.id == user.id:
        log_user_event(
            event_type="USER_DELETE",
            user_id=str(user.uuid),
            email=user.email,
            status="FAILED",
            ip_address=client_ip,
            details={"reason": "Self-deletion attempted"},
            error="Cannot delete yourself"
        )
        log_security_event(
            event_type="SELF_DELETION_ATTEMPT",
            email=user.email,
            severity="MEDIUM",
            ip_address=client_ip,
            details={"user_id": str(user.uuid)}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user_email = user.email
    user_uuid = str(user.uuid)
    
    db.delete(user)
    db.commit()
    
    # Log user deletion
    log_user_event(
        event_type="USER_DELETE",
        user_id=user_uuid,
        email=user_email,
        status="SUCCESS",
        ip_address=client_ip,
        admin_id=str(current_user.uuid) if current_user else None,
        details={"deleted_by": current_user.email if current_user else "system"}
    )
    
    log_audit_event(
        user_id=user_uuid,
        email=user_email,
        action="USER_DELETED",
        resource="user",
        details={
            "deleted_by": current_user.email if current_user else "system"
        }
    )
    
    return None


@user_router.post("/v1/userToken")
def get_token(
    request: UserCreate,
    req: Request
):
    client_ip, user_agent = get_client_info(req)
    user = request.model_dump()
    token = create_access_token(user)
    
    log_user_event(
        event_type="TOKEN_GENERATED",
        email=request.email,
        status="SUCCESS",
        ip_address=client_ip,
        details={"token_type": "access_token"}
    )
    
    return {"token": token}
from fastapi import APIRouter, Depends, status, Response, HTTPException
from modules.users.schemas.UserSchema import UserCreate, UserResponse, UserUpdate
from modules.users.models.UserModel import Users
import random
from core.database.authentication import get_password_hash, create_access_token, get_current_user
from core.database.settings import get_db
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List


user_router = APIRouter(prefix="/users")


def get_user_by_id(id: int, db: Session):
    return db.query(Users).filter(Users.id == id).first()


@user_router.get("/v1/get-all-users", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
def get_all_users(db:Session=Depends(get_db)):
    users = db.query(Users).order_by(Users.created_at.desc()).all()
    
    return users


@user_router.get("/v1/getUser/{id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user(id=id, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(Users).filter_by(id=id).first()
    print(current_user)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user


@user_router.post("/v1/addUser", status_code=status.HTTP_201_CREATED)
def add_user(request:UserCreate, response:Response, db:Session=Depends(get_db)):
    password = request.password
    password_hash = get_password_hash(password)
    profile_image_url = ""
    if request.profile_image:
        profile_image_url = request.profile_image
        
    is_active = True
    if request.is_active:
        is_active = request.is_active
    
    new_user = Users(uuid=uuid.uuid4(), full_name=request.full_name, email=request.email, password_hash=password_hash, phone_no=request.phone_no , profile_image=profile_image_url, is_active=is_active)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"msg":"User created successfully"}
    
    

@user_router.patch("/v1/updateUser/{id}", status_code=status.HTTP_200_OK)
def update_user(id:int, request:UserUpdate, db:Session=Depends(get_db)):
    user = get_user_by_id(id, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = request.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    return {"msg":"User data updated"}


@user_router.delete("/v1/deleteUser/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(id:int, db:Session=Depends(get_db)):
    user = get_user_by_id(id, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return None


@user_router.post("/v1/userToken")
def get_token(request:UserCreate):
    user = request.model_dump()
    token = create_access_token(user)
    
    return {"token":token}
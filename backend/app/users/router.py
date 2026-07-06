from fastapi import APIRouter
from app.users.schemas import UserRequest, UserResponse

user_router = APIRouter(prefix='/users')



@user_router.post("/v1/addUser", response_model=UserResponse)
def add_user(user: UserRequest):
    return user



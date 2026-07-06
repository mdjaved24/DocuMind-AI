from pydantic import BaseModel



class UserResponse(BaseModel):
    name:str
    username:str
    email:str
    
    
class UserRequest(BaseModel):
    name:str
    username:str
    email:str
    password:str
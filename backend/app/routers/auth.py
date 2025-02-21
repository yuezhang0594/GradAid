from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from ..supabase_client import supabase
from pydantic import BaseModel

router = APIRouter()

class UserResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/signup", response_model=UserResponse)
async def signup(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Sign up with Supabase
        auth_response = supabase.auth.sign_up({
            "email": form_data.username,
            "password": form_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Sign in immediately after signup
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=UserResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

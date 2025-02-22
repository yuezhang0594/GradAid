from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from ..supabase_client import supabase
from pydantic import BaseModel
from typing import Optional
from fastapi import Form

router = APIRouter()

class UserResponse(BaseModel):
    access_token: str
    token_type: str

class SocialLoginRequest(BaseModel):
    provider: str

class ResetPasswordRequest(BaseModel):
    email: str

class UpdatePasswordRequest(BaseModel):
    password: str

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

@router.post("/social-login", response_model=UserResponse)
async def social_login(request: SocialLoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_oauth({
            "provider": request.provider,
            "options": {
                "redirect_to": "http://localhost:5173"  # Vite default dev server
            }
        })
        
        if not auth_response.url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to generate OAuth URL"
            )
        
        return {
            "access_token": auth_response.url,  # Return the OAuth URL
            "token_type": "oauth_redirect"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        result = supabase.auth.reset_password_for_email(
            request.email,
            options={
                "redirect_to": "http://localhost:5173/reset-password"  # Update with your frontend URL
            }
        )
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/update-password")
async def update_password(
    request: UpdatePasswordRequest,
    token: str = Depends()
):
    try:
        result = supabase.auth.update_user({
            "password": request.password
        })
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

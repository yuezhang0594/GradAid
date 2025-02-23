from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from ..supabase_client import supabase
from fastapi.security import OAuth2PasswordBearer
from datetime import date

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class ProfileCreate(BaseModel):
    country: str
    dob: date
    education_level: str
    major: str
    gpa: Optional[float] = None
    gre_score: Optional[int] = None
    toefl_score: Optional[int] = None
    ielts_score: Optional[float] = None
    profile_description: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Verify the token with Supabase
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/")
async def create_profile(
    profile: ProfileCreate,
    current_user = Depends(get_current_user)
):
    try:
        # Check if profile exists
        existing_profile = supabase.table('User').select("*").eq('user_id', current_user.id).execute()
        
        if existing_profile.data:
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        # Get user metadata from auth
        user_metadata = current_user.user_metadata or {}
        email = current_user.email
        first_name = user_metadata.get('first_name', '')
        last_name = user_metadata.get('last_name', '')
        
        # Create new profile combining auth data and profile data
        result = supabase.table('User').insert({
            "user_id": current_user.id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            **profile.dict()
        }).execute()
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def read_profile(current_user = Depends(get_current_user)):
    try:
        result = supabase.table('User').select("*").eq('user_id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/me")
async def update_profile(
    profile: ProfileCreate,
    current_user = Depends(get_current_user)
):
    try:
        result = supabase.table('User').update(profile.dict()).eq('user_id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

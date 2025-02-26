from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "User"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    country = Column(String)
    education_level = Column(String)
    major = Column(String)
    gpa = Column(Float)
    gre_score = Column(Integer)
    toefl_score = Column(Integer)
    ielts_score = Column(Float)
    profile_description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="profile")
    
    # Add relationship to SOP
    sop = relationship("SOP", back_populates="profile", uselist=False)

class SOP(Base):
    __tablename__ = "sops"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("User.id"), unique=True)
    content = Column(String)
    prompt_template = Column(String)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    profile = relationship("Profile", back_populates="sop")
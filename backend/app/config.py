from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        SUPABASE_URL: The URL of your Supabase project
        SUPABASE_KEY: The anon/public key of your Supabase project
        SECRET_KEY: Secret key for JWT token signing
        ALGORITHM: Algorithm used for JWT token encoding
        ACCESS_TOKEN_EXPIRE_MINUTES: JWT token expiration time in minutes
    """
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # JWT settings
    SECRET_KEY: str = secrets.token_urlsafe(32)  # Generate a secure random key if not provided
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Optional settings
    ENVIRONMENT: Optional[str] = "development"
    DEBUG: bool = False

    @property
    def is_development(self) -> bool:
        """Check if the application is running in development mode."""
        return self.ENVIRONMENT.lower() == "development"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def validate_supabase_url(self) -> None:
        """Validate that the Supabase URL is properly formatted."""
        if not self.SUPABASE_URL.startswith(("http://", "https://")):
            raise ValueError("SUPABASE_URL must start with http:// or https://")

    def validate_supabase_key(self) -> None:
        """Validate that the Supabase key is not empty."""
        if not self.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY cannot be empty")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.validate_supabase_url()
        self.validate_supabase_key()

settings = Settings()

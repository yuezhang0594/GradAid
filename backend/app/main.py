from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, profiles

app = FastAPI(title="GradAid API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])

@app.get("/")
def read_root():
    return {"message": "Welcome to GradAid API"}

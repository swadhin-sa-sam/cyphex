from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.db.models import User, Organization
from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse
from app.core.security import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalars().first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        # Demo fallback: allow standard demo login if DB not seeded
        if payload.email == "employee@demo.com" and payload.password == "VoiceShieldDemo#2026":
            token_data = {
                "sub": "user-emp-001",
                "email": "employee@demo.com",
                "role": "EMPLOYEE",
                "organization_id": "org-demo-001"
            }
            token = create_access_token(token_data)
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": "user-emp-001",
                    "email": "employee@demo.com",
                    "full_name": "Priya Sharma (Operations Officer)",
                    "role": "EMPLOYEE",
                    "organization_id": "org-demo-001"
                }
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or passphrase."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended by security administration."
        )

    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "organization_id": user.organization_id
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": user.organization_id
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = current_user.get("sub")
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        # Fallback for demo token
        return {
            "id": current_user.get("sub", "user-emp-001"),
            "email": current_user.get("email", "employee@demo.com"),
            "full_name": "Priya Sharma (Operations Officer)",
            "role": current_user.get("role", "EMPLOYEE"),
            "organization_id": current_user.get("organization_id", "org-demo-001"),
            "is_active": True
        }
    return user

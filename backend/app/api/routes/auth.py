from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import time
import uuid

from app.db.database import get_db
from app.db.models import User
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    generate_api_key
)

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

class UserRegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "operator"

class UserLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ApiKeyResponse(BaseModel):
    api_key: str
    created_at: float
    note: str

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if username or email already exists
    stmt = select(User).where((User.username == req.username) | (User.email == req.email))
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    user_id = "usr_" + uuid.uuid4().hex[:12]
    new_user = User(
        id=user_id,
        username=req.username.strip(),
        email=req.email.strip().lower(),
        hashed_password=get_password_hash(req.password),
        role=req.role if req.role in ["admin", "operator", "auditor"] else "operator",
        api_key=generate_api_key(),
        created_at=time.time(),
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(data={
        "sub": new_user.username,
        "user_id": new_user.id,
        "role": new_user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role,
            "api_key": new_user.api_key
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.username == req.username)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(data={
        "sub": user.username,
        "user_id": user.id,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "api_key": user.api_key
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current_user.get("is_authenticated"):
        return {
            "id": "guest_soc",
            "username": "guest_operator",
            "role": "operator",
            "is_authenticated": False,
            "permissions": ["stream:read", "stream:write"]
        }

    stmt = select(User).where(User.username == current_user["username"])
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        return current_user

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "api_key": user.api_key,
        "created_at": user.created_at,
        "is_authenticated": True,
        "permissions": ["admin:all"] if user.role == "admin" else ["stream:read", "stream:write", "enroll:speaker"]
    }

@router.post("/api-key", response_model=ApiKeyResponse)
async def rotate_api_key(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current_user.get("is_authenticated"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required to generate API Key")

    stmt = select(User).where(User.username == current_user["username"])
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_key = generate_api_key()
    user.api_key = new_key
    await db.commit()

    return {
        "api_key": new_key,
        "created_at": time.time(),
        "note": "Use this Bearer key in X-CYPHEX-API-KEY header for PBX / SIP Trunking verification."
    }

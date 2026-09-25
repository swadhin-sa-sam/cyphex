import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import hashlib
import hmac
import base64
import json
import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)

# Robust PBKDF2-HMAC-SHA256 password hasher with salt (pure Python standard library fallback, zero C-lib compilation dependencies)
def get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return base64.b64encode(salt + key).decode('ascii')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        raw = base64.b64decode(hashed_password.encode('ascii'))
        salt = raw[:16]
        expected_key = raw[16:]
        new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(expected_key, new_key)
    except Exception:
        return False

# Standard JWT implementation with HMAC-SHA256
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})
    
    # Base64URL encode header and payload
    header = {"alg": settings.JWT_ALGORITHM, "typ": "JWT"}
    header_bytes = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).rstrip(b'=')
    payload_bytes = base64.urlsafe_b64encode(json.dumps(to_encode).encode('utf-8')).rstrip(b'=')
    
    signing_input = header_bytes + b'.' + payload_bytes
    signature = hmac.new(settings.JWT_SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_bytes = base64.urlsafe_b64encode(signature).rstrip(b'=')
    
    return (header_bytes + b'.' + payload_bytes + b'.' + sig_bytes).decode('ascii')

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_bytes = parts[0].encode('ascii')
        payload_bytes = parts[1].encode('ascii')
        sig_bytes = parts[2].encode('ascii')
        
        signing_input = header_bytes + b'.' + payload_bytes
        expected_sig = hmac.new(settings.JWT_SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(sig_bytes + b'=' * (-len(sig_bytes) % 4))
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_json = base64.urlsafe_b64decode(payload_bytes + b'=' * (-len(payload_bytes) % 4)).decode('utf-8')
        payload = json.loads(payload_json)
        
        # Verify expiration
        exp = payload.get("exp")
        if exp and int(time.time()) > exp:
            return None
            
        return payload
    except Exception:
        return None

def generate_api_key() -> str:
    return "cyphex_live_" + secrets.token_hex(24)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)
):
    from app.db.database import get_db
    from app.db.models import User
    
    auth_token = token or (bearer.credentials if bearer else None)
    if not auth_token:
        # Return anonymous guest operator for development accessibility if no token provided
        return {
            "id": "guest_operator",
            "username": "guest_soc_operator",
            "role": "operator",
            "is_authenticated": False
        }
    
    payload = decode_access_token(auth_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
    return {
        "id": payload.get("user_id", "usr_soc"),
        "username": username,
        "role": payload.get("role", "operator"),
        "is_authenticated": True
    }

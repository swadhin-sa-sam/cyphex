from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "VoiceShield AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://voiceshield:voiceshield@localhost:5432/voiceshield"
    SQLITE_FALLBACK_URL: str = "sqlite+aiosqlite:///./voiceshield.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    JWT_SECRET: str = "voiceshield-ultra-secure-sih2026-secret-key-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    FERNET_KEY: str = "V29pY2VTaGllbGRTZWN1cmVLZXlGb3JCaW9tZXRyaWNzMjAyNg=="
    
    # Audio & ML
    SAMPLE_RATE: int = 16000
    CHUNK_SIZE_MS: int = 250
    WINDOW_SIZE_SEC: float = 2.0
    MODEL_DEVICE: str = "cpu"
    USE_MOCK_ML: bool = True
    
    # Privacy & Compliance
    DEFAULT_AUDIO_RETENTION_DAYS: int = 0
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

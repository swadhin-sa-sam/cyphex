from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import torch
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYPHEX"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Computation device
    MODEL_DEVICE: str = Field(default="cuda" if torch.cuda.is_available() else "cpu")
    
    # Audio pipeline parameters
    SAMPLE_RATE: int = 16000
    CHUNK_DURATION_MS: int = 250
    WINDOW_DURATION_S: float = 2.0
    VAD_THRESHOLD: float = 0.40
    
    # Scoring & thresholds
    EMA_ALPHA: float = 0.30
    SPOOF_THRESHOLD: float = 0.70
    SPEAKER_MATCH_THRESHOLD: float = 0.75
    HIGH_FREQ_CUTOFF_DB_DROP: float = 40.0
    
    # Storage & Persistence
    DATABASE_URL: str = "postgresql+asyncpg://cyphex:cyphex_secret@localhost:5432/cyphex"
    SQLITE_FALLBACK_URL: str = "sqlite+aiosqlite:///./cyphex.db"
    REDIS_URL: str = "redis://localhost:6379"
    ENCRYPTION_KEY_FILE: str = "./cyphex_vault.key"
    
    # Security & Authentication
    JWT_SECRET_KEY: str = "cyphex_enterprise_super_secret_jwt_key_2026_sih"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    DEFAULT_ADMIN_USERNAME: str = "soc_admin"
    DEFAULT_ADMIN_PASSWORD: str = "Cyphex@2026!SIH"
    
    # Inference Modes
    USE_MOCK_INFERENCE: bool = False
    
    # Optional integrations
    SMS_API_KEY: str | None = None
    EMAIL_SMTP_HOST: str | None = None
    WEBHOOK_URL: str | None = None
    
    # Models & Weights
    AASIST_MODEL_PATH: str = "./models/aasist.pth"
    WAV2VEC2_MODEL_NAME: str = "facebook/wav2vec2-large-xlsr-53"
    ECAPA_MODEL_SOURCE: str = "speechbrain/spkrec-ecapa-voxceleb"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


    @property
    def CHUNK_SAMPLES(self) -> int:
        return int(self.SAMPLE_RATE * (self.CHUNK_DURATION_MS / 1000.0))

    @property
    def WINDOW_SAMPLES(self) -> int:
        return int(self.SAMPLE_RATE * self.WINDOW_DURATION_S)

settings = Settings()

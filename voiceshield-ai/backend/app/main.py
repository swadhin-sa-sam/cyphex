import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import init_db
from app.api.routes import (
    auth, calls, websocket, transactions,
    verification, incidents, voice_profiles,
    dashboard, settings as settings_route, demo
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("voiceshield.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Initializing {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        await init_db()
        logger.info("Database initialized and demo seed loaded.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    yield
    logger.info("Shutting down VoiceShield AI...")

app = FastAPI(
    title="VoiceShield AI Backend API",
    description="Real-Time Voice Integrity, Impersonation Risk Detection & Transaction Protection Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes
app.include_router(auth.router)
app.include_router(calls.router)
app.include_router(websocket.router)
app.include_router(transactions.router)
app.include_router(verification.router)
app.include_router(incidents.router)
app.include_router(voice_profiles.router)
app.include_router(dashboard.router)
app.include_router(settings_route.router)
app.include_router(demo.router)

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "model_device": settings.MODEL_DEVICE,
        "use_mock_ml": settings.USE_MOCK_ML
    }

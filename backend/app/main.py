from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.db.database import init_db
from app.api.routes import websocket, rest, enrollment, alerts, auth, demo
from app.api.middleware import RequestLoggingMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cyphex.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Initializing {settings.PROJECT_NAME} v{settings.VERSION}...")
    logger.info(f"Compute device: {settings.MODEL_DEVICE}")
    
    # 1. Initialize Database (PostgreSQL with SQLite fallback & default SOC admin)
    try:
        await init_db()
        logger.info("CYPHEX database initialized and verified.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

    # 2. Model Registry in app.state.models
    app.state.models = {}
    
    # VAD
    try:
        from app.core.vad import VoiceActivityDetector
        app.state.models['vad'] = VoiceActivityDetector()
        logger.info("VAD model loaded.")
    except Exception as e:
        logger.warning(f"VAD model failed to initialize ({e}). Falling back to energy VAD.")
        app.state.models['vad'] = None

    # AASIST
    try:
        from app.ml.anti_spoof.aasist_model import AASISTDetector
        app.state.models['aasist'] = AASISTDetector()
        logger.info("AASIST Anti-spoofing engine initialized.")
    except Exception as e:
        logger.warning(f"AASIST model failed to initialize ({e}).")
        app.state.models['aasist'] = None

    # Wav2Vec2
    try:
        from app.ml.anti_spoof.wav2vec2_model import Wav2Vec2Detector
        app.state.models['wav2vec2'] = Wav2Vec2Detector()
        logger.info("Wav2Vec2 Deepfake classifier initialized.")
    except Exception as e:
        logger.warning(f"Wav2Vec2 model failed to initialize ({e}). Using spectral heuristics fallback.")
        app.state.models['wav2vec2'] = None

    # ECAPA-TDNN Speaker Verifier
    try:
        from app.ml.speaker.ecapa_tdnn import SpeakerVerifier
        app.state.models['speaker_verifier'] = SpeakerVerifier()
        logger.info("ECAPA-TDNN biometric speaker verifier initialized.")
    except Exception as e:
        logger.warning(f"ECAPA-TDNN speaker verifier failed to initialize ({e}).")
        app.state.models['speaker_verifier'] = None

    logger.info(f"{settings.PROJECT_NAME} application ready to accept traffic.")
    yield
    
    logger.info("Shutting down CYPHEX Application, freeing GPU memory and active resources...")
    app.state.models.clear()

app = FastAPI(
    title="CYPHEX Backend",
    description="Real-time AI-Powered Voice Integrity Verification & Anti-Spoofing API",
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
app.add_middleware(RequestLoggingMiddleware)

# Mount Routers
app.include_router(websocket.router)
app.include_router(rest.router)
app.include_router(enrollment.router)
app.include_router(alerts.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api")
app.include_router(auth.router)
app.include_router(demo.router, prefix="/api/v1")
app.include_router(demo.router, prefix="/api")
app.include_router(demo.router)

@app.get("/health")
async def health_check():
    models = getattr(app.state, "models", {})
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "device": settings.MODEL_DEVICE,
        "models": {
            "vad": models.get("vad") is not None,
            "aasist": models.get("aasist") is not None,
            "wav2vec2": models.get("wav2vec2") is not None,
            "speaker_verifier": models.get("speaker_verifier") is not None,
        }
    }

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
import librosa
import io
import logging
from app.config import settings
from app.ml.speaker.enrollment_store import enrollment_store

router = APIRouter(prefix="/api/v1/speakers", tags=["enrollment"])
logger = logging.getLogger("cyphex.enrollment")

@router.post("/enroll")
async def enroll_speaker(
    request: Request,
    name: str = Form(...),
    file: UploadFile = File(...)
):
    models = getattr(request.app.state, "models", {})
    speaker_verifier = models.get('speaker_verifier')
    if not speaker_verifier:
        raise HTTPException(status_code=503, detail="Speaker verification engine is unavailable")
        
    try:
        content = await file.read()
        audio_stream = io.BytesIO(content)
        y, _ = librosa.load(audio_stream, sr=settings.SAMPLE_RATE, mono=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read audio file: {e}")
        
    if len(y) < int(settings.SAMPLE_RATE * 0.5):
        raise HTTPException(status_code=400, detail="Voice reference must be at least 0.5 seconds long")

    try:
        embedding = speaker_verifier.enroll([y])
        speaker_id = enrollment_store.add_speaker(
            name=name.strip(),
            embedding=embedding,
            metadata={"filename": file.filename, "samples": len(y)}
        )
        return {
            "status": "success",
            "speaker_id": speaker_id,
            "name": name.strip(),
            "enrolled_duration_sec": round(len(y) / settings.SAMPLE_RATE, 2)
        }
    except Exception as e:
        logger.error(f"Failed to enroll speaker: {e}")
        raise HTTPException(status_code=500, detail=f"Enrollment failure: {e}")

@router.get("")
async def list_speakers():
    try:
        speakers = enrollment_store.list_speakers()
        return [
            {
                "id": s.id,
                "name": s.name,
                "enrolled_at": s.enrolled_at,
                "metadata": s.metadata
            }
            for s in speakers
        ]
    except Exception as e:
        logger.error(f"Failed to list speakers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{speaker_id}")
async def get_speaker(speaker_id: str):
    speaker = enrollment_store.get_speaker(speaker_id)
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker profile not found")
    return {
        "id": speaker.id,
        "name": speaker.name,
        "enrolled_at": speaker.enrolled_at,
        "metadata": speaker.metadata
    }

@router.delete("/{speaker_id}")
async def delete_speaker(speaker_id: str):
    success = enrollment_store.delete_speaker(speaker_id)
    if not success:
        raise HTTPException(status_code=404, detail="Speaker not found or already deleted")
    return {"status": "success", "message": f"Speaker {speaker_id} deleted"}

@router.post("/{speaker_id}/verify")
async def verify_speaker(
    request: Request,
    speaker_id: str,
    file: UploadFile = File(...)
):
    speaker = enrollment_store.get_speaker(speaker_id)
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker profile not found")
        
    models = getattr(request.app.state, "models", {})
    speaker_verifier = models.get('speaker_verifier')
    if not speaker_verifier:
        raise HTTPException(status_code=503, detail="Speaker verification engine is unavailable")
        
    try:
        content = await file.read()
        audio_stream = io.BytesIO(content)
        y, _ = librosa.load(audio_stream, sr=settings.SAMPLE_RATE, mono=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode audio: {e}")
        
    res = speaker_verifier.verify(y, speaker.embedding)
    return {
        "speaker_id": speaker.id,
        "speaker_name": speaker.name,
        "is_match": res.is_match,
        "similarity": round(res.similarity, 4),
        "threshold": res.threshold
    }

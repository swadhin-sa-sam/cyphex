from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
import librosa
import numpy as np
import io
import time
from app.config import settings
from app.core.session_manager import session_manager
from app.ml.risk_engine.score_fusion import ScoreFusionEngine, DetectionScores
from app.ml.risk_engine.threshold_engine import ThresholdEngine
from app.ml.anti_spoof.spectral_heuristics import SpectralHeuristicAnalyzer
from app.ml.prosody.prosody_analyzer import ProsodyAnalyzer
from app.ml.speaker.enrollment_store import enrollment_store

router = APIRouter(prefix="/api/v1", tags=["rest"])

@router.post("/analyze")
async def analyze_file(
    request: Request,
    file: UploadFile = File(...),
    profile: str = Form("STANDARD"),
    speaker_id: str = Form(None)
):
    valid_exts = ('.wav', '.flac', '.mp3', '.ogg', '.m4a')
    if not any(file.filename.lower().endswith(ext) for ext in valid_exts):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Allowed: {', '.join(valid_exts)}"
        )
        
    start_time = time.perf_counter()
    try:
        content = await file.read()
        audio_stream = io.BytesIO(content)
        y, sr = librosa.load(audio_stream, sr=settings.SAMPLE_RATE, mono=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode audio file: {e}")

    if len(y) == 0:
        raise HTTPException(status_code=400, detail="Audio file contains no audio data.")

    # Access models from app.state
    models = getattr(request.app.state, "models", {})
    aasist = models.get('aasist')
    wav2vec2 = models.get('wav2vec2')
    speaker_verifier = models.get('speaker_verifier')

    spectral_analyzer = SpectralHeuristicAnalyzer()
    prosody_analyzer = ProsodyAnalyzer()
    fusion_engine = ScoreFusionEngine()
    threshold_engine = ThresholdEngine()

    duration_sec = float(len(y) / sr)

    # 1. Run Global Heuristics & Prosody
    spectral_res = spectral_analyzer.analyze(y, sr)
    prosody_res = prosody_analyzer.analyze(y, sr)

    # 2. Chunk-based Model Inference (2.0s chunks with 1.0s overlap)
    window_samples = settings.WINDOW_SAMPLES
    step_samples = settings.SAMPLE_RATE  # 1.0s step
    
    aasist_scores = []
    w2v2_scores = []
    
    if len(y) <= window_samples:
        padded_y = np.pad(y, (0, max(0, window_samples - len(y))))
        if aasist:
            try: aasist_scores.append(aasist.predict(padded_y))
            except Exception: pass
        if wav2vec2:
            try: w2v2_scores.append(wav2vec2.predict(padded_y))
            except Exception: pass
    else:
        for start in range(0, len(y) - window_samples + 1, step_samples):
            chunk = y[start:start + window_samples]
            if aasist:
                try: aasist_scores.append(aasist.predict(chunk))
                except Exception: pass
            if wav2vec2:
                try: w2v2_scores.append(wav2vec2.predict(chunk))
                except Exception: pass

    mean_aasist = float(np.mean(aasist_scores)) if aasist_scores else 0.0
    mean_w2v2 = float(np.mean(w2v2_scores)) if w2v2_scores else 0.0

    # 3. Speaker Verification (if speaker_id provided)
    speaker_dissimilarity = 0.0
    speaker_match = True
    speaker_sim = 1.0
    ref_speaker = enrollment_store.get_speaker(speaker_id) if speaker_id else None
    
    if ref_speaker and speaker_verifier:
        try:
            verif_res = speaker_verifier.verify(y, ref_speaker.embedding)
            speaker_sim = float(verif_res.similarity)
            speaker_dissimilarity = max(0.0, 1.0 - speaker_sim)
            speaker_match = verif_res.is_match
        except Exception:
            pass

    # 4. Score Fusion & Decision
    det_scores = DetectionScores(
        aasist_score=mean_aasist,
        wav2vec2_score=mean_w2v2,
        prosody_anomaly_score=prosody_res.anomaly_score,
        spectral_heuristic_score=spectral_res.anomaly_score,
        speaker_dissimilarity=speaker_dissimilarity,
        has_speaker_target=bool(ref_speaker is not None)
    )
    
    fused = fusion_engine.compute(det_scores)
    decision = threshold_engine.evaluate(fused.raw_score, profile)
    
    proc_time_ms = int((time.perf_counter() - start_time) * 1000)

    return {
        "status": "success",
        "filename": file.filename,
        "duration_seconds": round(duration_sec, 2),
        "processing_time_ms": proc_time_ms,
        "verdict": {
            "is_deepfake": bool(fused.raw_score >= settings.SPOOF_THRESHOLD),
            "risk_score": round(fused.raw_score, 4),
            "risk_level": decision.risk_level,
            "recommendation": decision.recommendation_text,
            "anomaly_flags": fused.anomaly_flags
        },
        "layer_breakdown": {
            "aasist_acoustic_score": round(mean_aasist, 4),
            "wav2vec2_ssl_score": round(mean_w2v2, 4),
            "prosody_anomaly_score": round(prosody_res.anomaly_score, 4),
            "spectral_anomaly_score": round(spectral_res.anomaly_score, 4),
            "speaker_similarity": round(speaker_sim, 4) if ref_speaker else None,
            "speaker_match": speaker_match if ref_speaker else None
        },
        "prosodic_biomarkers": {
            "local_jitter_pct": round(prosody_res.local_jitter_pct, 3),
            "local_shimmer_pct": round(prosody_res.local_shimmer_pct, 3),
            "mean_hnr_db": round(prosody_res.mean_hnr_db, 2),
            "mean_f0_hz": round(prosody_res.mean_f0_hz, 1),
            "is_abnormally_smooth": prosody_res.is_abnormally_smooth
        },
        "spectral_anomalies": {
            "has_highfreq_cutoff": spectral_res.has_highfreq_cutoff,
            "cutoff_frequency_hz": spectral_res.cutoff_frequency_hz,
            "phase_consistency_score": round(spectral_res.phase_consistency_score, 3),
            "has_checkerboard_artifacts": spectral_res.has_checkerboard_artifacts
        }
    }

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "id": session.id,
        "created_at": session.created_at,
        "is_active": session.is_active,
        "risk_level": session.risk_level,
        "score_history": session.score_history
    }

@router.get("/sessions/{session_id}/report")
async def get_session_report(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    scores = session.score_history
    avg_score = float(np.mean(scores)) if scores else 0.0
    max_score = float(np.max(scores)) if scores else 0.0
    
    return {
        "session_id": session.id,
        "is_active": session.is_active,
        "created_at": session.created_at,
        "samples_evaluated": len(scores),
        "average_risk": round(avg_score, 4),
        "peak_risk": round(max_score, 4),
        "risk_level": session.risk_level,
        "status": "COMPLETED" if not session.is_active else "ACTIVE"
    }

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import numpy as np
import time
import logging
from app.config import settings
from app.core.session_manager import session_manager
from app.ml.risk_engine.score_fusion import ScoreFusionEngine, DetectionScores
from app.ml.risk_engine.ema_smoother import EMAScoreSmoother
from app.ml.risk_engine.threshold_engine import ThresholdEngine
from app.ml.speaker.enrollment_store import enrollment_store
from app.ml.anti_spoof.spectral_heuristics import SpectralHeuristicAnalyzer
from app.ml.prosody.prosody_analyzer import ProsodyAnalyzer
from app.alerts.alert_manager import alert_manager

router = APIRouter(prefix="/ws", tags=["websocket"])
logger = logging.getLogger("cyphex.websocket")

@router.websocket("/stream-detect")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str = Query(None),
    profile: str = Query("STANDARD"),
    speaker_id: str = Query(None),
    threat_type: str = Query(None)
):
    await websocket.accept()
    
    session = session_manager.get_session(session_id) if session_id else None
    if not session:
        session = session_manager.create_session(session_id=session_id)
        
    smoother = EMAScoreSmoother(alpha=settings.EMA_ALPHA)
    fusion_engine = ScoreFusionEngine()
    threshold_engine = ThresholdEngine()
    spectral_analyzer = SpectralHeuristicAnalyzer()
    prosody_analyzer = ProsodyAnalyzer()
    
    # Models from app.state
    models = getattr(websocket.app.state, "models", {})
    vad = models.get('vad')
    aasist = models.get('aasist')
    wav2vec2 = models.get('wav2vec2')
    speaker_verifier = models.get('speaker_verifier')
    
    ref_speaker = None
    if speaker_id:
        ref_speaker = enrollment_store.get_speaker(speaker_id)
        if ref_speaker:
            logger.info(f"Session {session.id} tracking enrolled speaker: {ref_speaker.name}")


    try:
        while True:
            raw_bytes = await websocket.receive_bytes()
            start_time = time.perf_counter()
            
            # Defensive padding: ensure even byte count for 16-bit PCM
            if len(raw_bytes) < 2:
                continue
            valid_len = len(raw_bytes) - (len(raw_bytes) % 2)
            
            audio_data = np.frombuffer(raw_bytes[:valid_len], dtype=np.int16).astype(np.float32) / 32768.0
            if len(audio_data) == 0:
                continue
            
            # Voice Activity Detection
            is_voiced = True
            if vad is not None:
                try:
                    is_voiced = vad.is_speech(audio_data, settings.SAMPLE_RATE, threshold=settings.VAD_THRESHOLD)
                except Exception as e:
                    is_voiced = bool(np.sqrt(np.mean(audio_data ** 2)) > 0.01)
            else:
                # Energy-based VAD fallback
                rms = float(np.sqrt(np.mean(audio_data ** 2)))
                is_voiced = rms > 0.015
                
            # If silence and buffer not ready, report status and continue
            if not is_voiced and not session.audio_buffer.is_ready:
                await websocket.send_json({
                    "session_id": session.id,
                    "status": "silence",
                    "speech_active": False,
                    "score": smoother.current_score,
                    "fill_ratio": session.audio_buffer.fill_ratio
                })
                continue
                
            # Append audio chunk to circular sliding window
            session.audio_buffer.append(audio_data)
            
            if session.audio_buffer.is_ready:
                window = session.audio_buffer.get_window()
                
                # Use mock engine if threat_type is specified (Demo Simulator) or USE_MOCK_INFERENCE is set
                from app.ml.mock_engine import mock_engine
                if threat_type or settings.USE_MOCK_INFERENCE or (not aasist and not wav2vec2):
                    mock_res = mock_engine.analyze_chunk(window, settings.SAMPLE_RATE, forced_threat_type=threat_type)
                    score_aasist = mock_res["aasist_score"]
                    score_w2v2 = mock_res["wav2vec2_score"]
                    spectral_res_anomaly = 0.85 if "HIGH_FREQ_CUTOFF" in mock_res["anomaly_flags"] else 0.1
                    prosody_res_anomaly = 0.90 if "VOICE_CLONE_DETECTED" in mock_res["anomaly_flags"] else 0.1
                    jitter_val = mock_res["jitter"]
                    shimmer_val = mock_res["shimmer"]
                    hnr_val = mock_res["hnr"]
                    f0_val = mock_res["f0_mean"]
                    sim_flags = mock_res["anomaly_flags"]
                    speaker_dissimilarity = 0.55 if "BIOMETRIC_MISMATCH" in sim_flags else 0.05
                else:
                    # 1. Anti-Spoofing Inference
                    score_aasist = 0.0
                    if aasist:
                        try:
                            score_aasist = float(aasist.predict(window))
                        except Exception as e:
                            logger.error(f"AASIST inference error: {e}")
                            
                    score_w2v2 = 0.0
                    if wav2vec2:
                        try:
                            score_w2v2 = float(wav2vec2.predict(window))
                        except Exception as e:
                            logger.error(f"Wav2Vec2 inference error: {e}")
                            
                    # 2. Heuristic & Prosodic Analysis
                    spectral_res = spectral_analyzer.analyze(window, settings.SAMPLE_RATE)
                    prosody_res = prosody_analyzer.analyze(window, settings.SAMPLE_RATE)
                    spectral_res_anomaly = spectral_res.anomaly_score
                    prosody_res_anomaly = prosody_res.anomaly_score
                    jitter_val = prosody_res.jitter
                    shimmer_val = prosody_res.shimmer
                    hnr_val = prosody_res.hnr
                    f0_val = prosody_res.f0_mean
                    sim_flags = []
                    
                    # 3. Biometric Speaker Verification (if VIP speaker enrolled)
                    speaker_dissimilarity = 0.0
                    speaker_match = True
                    similarity = 1.0
                    if ref_speaker and speaker_verifier:
                        try:
                            verif_res = speaker_verifier.verify(window, ref_speaker.embedding)
                            similarity = float(verif_res.similarity)
                            speaker_dissimilarity = max(0.0, 1.0 - similarity)
                            speaker_match = verif_res.is_match
                        except Exception as e:
                            logger.error(f"Speaker verification error: {e}")
                            
                # 4. Score Fusion & Exponential Moving Average
                det_scores = DetectionScores(
                    aasist_score=score_aasist,
                    wav2vec2_score=score_w2v2,
                    prosody_anomaly_score=prosody_res_anomaly,
                    spectral_heuristic_score=spectral_res_anomaly,
                    speaker_dissimilarity=speaker_dissimilarity,
                    has_speaker_target=bool(ref_speaker is not None)
                )

                
                fused = fusion_engine.compute(det_scores)
                smoothed_score = smoother.update(fused.raw_score)
                session.score_history.append(smoothed_score)
                
                # 5. Threshold & Policy Engine
                decision = threshold_engine.evaluate(smoothed_score, profile)
                
                # 6. Automatic Alerting on Policy Breach
                if decision.should_alert:
                    try:
                        await alert_manager.send_alert(
                            session_id=session.id,
                            risk_score=smoothed_score,
                            anomaly_flags=fused.anomaly_flags,
                            recommendation=decision.recommendation_text
                        )
                    except Exception as e:
                        logger.warning(f"Alert dispatch failed: {e}")
                
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                
                # Unified Response Payload formatted for Frontend
                response = {
                    "session_id": session.id,
                    "status": "analyzed",
                    "speech_active": is_voiced,
                    "latency_ms": latency_ms,
                    "score": float(smoothed_score),
                    "risk_level": decision.risk_level,
                    "recommendation": decision.recommendation_text,
                    "anomaly_flags": fused.anomaly_flags,
                    "scores": {
                        "aasist": round(score_aasist, 4),
                        "wav2vec2": round(score_w2v2, 4),
                        "prosody": round(prosody_res.anomaly_score, 4),
                        "spectral": round(spectral_res.anomaly_score, 4),
                        "fused": round(fused.raw_score, 4),
                        "smoothed_risk": round(smoothed_score, 4)
                    },
                    "speaker_match": speaker_match,
                    "speaker_similarity": round(similarity, 4),
                    # Top-level prosody fields for frontend widgets
                    "jitter": round(prosody_res.local_jitter_pct, 2),
                    "shimmer": round(prosody_res.local_shimmer_pct, 2),
                    "hnr": round(prosody_res.mean_hnr_db, 1),
                    "f0_mean": round(prosody_res.mean_f0_hz, 1),
                    "decision": {
                        "should_alert": decision.should_alert,
                        "should_block": decision.should_block,
                        "requires_mfa": decision.requires_mfa,
                        "risk_level": decision.risk_level,
                        "recommendation": decision.recommendation_text
                    }
                }
                
                await websocket.send_json(response)
                # DO NOT clear buffer here: maintain continuous sliding window for 4Hz updates!
            else:
                await websocket.send_json({
                    "session_id": session.id,
                    "status": "buffering",
                    "fill_ratio": session.audio_buffer.fill_ratio,
                    "speech_active": is_voiced
                })

    except WebSocketDisconnect:
        logger.info(f"Client disconnected for session {session.id}")
    except Exception as e:
        logger.error(f"WebSocket session exception ({session.id}): {e}")
    finally:
        session_manager.end_session(session.id)

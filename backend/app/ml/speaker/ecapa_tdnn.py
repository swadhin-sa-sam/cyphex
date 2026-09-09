import torch
import numpy as np
import logging
from dataclasses import dataclass
from app.config import settings

logger = logging.getLogger("cyphex.speaker")

@dataclass
class VerificationResult:
    similarity: float
    is_match: bool
    threshold: float

class SpeakerVerifier:
    def __init__(self):
        self.device = settings.MODEL_DEVICE
        self.classifier = None
        self._init_model()

    def _init_model(self):
        try:
            try:
                from speechbrain.inference.speaker import SpeakerRecognition
                self.classifier = SpeakerRecognition.from_hparams(
                    source=settings.ECAPA_MODEL_SOURCE,
                    savedir="./models/speechbrain_ecapa",
                    run_opts={"device": self.device},
                    local_files_only=True
                )
                logger.info(f"Loaded SpeechBrain ECAPA-TDNN via SpeakerRecognition on {self.device}")
                return
            except Exception:
                pass

            try:
                from speechbrain.pretrained import EncoderClassifier
                self.classifier = EncoderClassifier.from_hparams(
                    source=settings.ECAPA_MODEL_SOURCE,
                    savedir="./models/speechbrain_ecapa",
                    run_opts={"device": self.device},
                    local_files_only=True
                )
                logger.info(f"Loaded SpeechBrain ECAPA-TDNN via EncoderClassifier on {self.device}")
                return
            except Exception:
                pass

            logger.info("SpeechBrain ECAPA-TDNN not cached locally; operating in acoustic-embedding fallback mode.")
            self.classifier = None
        except Exception as e:
            logger.warning(f"Could not initialize SpeechBrain ECAPA-TDNN ({e}). Operating in acoustic-embedding fallback mode.")
            self.classifier = None

    def encode(self, audio: np.ndarray) -> np.ndarray:
        if audio is None or len(audio) == 0:
            return np.zeros(192, dtype=np.float32)
            
        clean_audio = np.asarray(audio, dtype=np.float32).flatten()

        if self.classifier is not None:
            try:
                with torch.no_grad():
                    tensor = torch.from_numpy(clean_audio).float().to(self.device)
                    if tensor.ndim == 1:
                        tensor = tensor.unsqueeze(0)
                    embeddings = self.classifier.encode_batch(tensor)
                    emb = embeddings.squeeze().detach().cpu().numpy()
                    norm = np.linalg.norm(emb)
                    return (emb / norm) if norm > 1e-6 else emb
            except Exception as e:
                logger.error(f"ECAPA-TDNN encoding error: {e}")

        # High-order Acoustic Spectral Fingerprint Fallback (192-dim)
        try:
            import librosa
            mfcc = librosa.feature.mfcc(y=clean_audio, sr=settings.SAMPLE_RATE, n_mfcc=24)
            delta = librosa.feature.delta(mfcc)
            delta2 = librosa.feature.delta(mfcc, order=2)
            stats = np.concatenate([
                np.mean(mfcc, axis=1), np.std(mfcc, axis=1),
                np.mean(delta, axis=1), np.std(delta, axis=1),
                np.mean(delta2, axis=1), np.std(delta2, axis=1),
                np.percentile(mfcc, 25, axis=1), np.percentile(mfcc, 75, axis=1)
            ])
            if len(stats) > 192:
                stats = stats[:192]
            elif len(stats) < 192:
                stats = np.pad(stats, (0, 192 - len(stats)))
            norm = np.linalg.norm(stats)
            return (stats / norm).astype(np.float32) if norm > 1e-6 else stats.astype(np.float32)
        except Exception:
            return np.zeros(192, dtype=np.float32)

    def verify(self, test_audio: np.ndarray, reference_embedding: np.ndarray) -> VerificationResult:
        test_emb = self.encode(test_audio)
        ref_emb = np.asarray(reference_embedding, dtype=np.float32).flatten()
        
        norm_t = np.linalg.norm(test_emb)
        norm_r = np.linalg.norm(ref_emb)
        
        if norm_t < 1e-6 or norm_r < 1e-6:
            sim = 0.0
        else:
            sim = float(np.dot(test_emb, ref_emb) / (norm_t * norm_r))
            sim = max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim))
            
        threshold = float(settings.SPEAKER_MATCH_THRESHOLD)
        return VerificationResult(
            similarity=round(sim, 4),
            is_match=bool(sim >= threshold),
            threshold=threshold
        )

    def enroll(self, audio_segments: list[np.ndarray]) -> np.ndarray:
        valid_segments = [s for s in audio_segments if s is not None and len(s) > 0]
        if not valid_segments:
            return np.zeros(192, dtype=np.float32)
            
        embeddings = [self.encode(seg) for seg in valid_segments]
        avg_embedding = np.mean(embeddings, axis=0)
        norm = np.linalg.norm(avg_embedding)
        return (avg_embedding / norm).astype(np.float32) if norm > 1e-6 else avg_embedding.astype(np.float32)

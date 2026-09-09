import torch
import numpy as np
import logging
from app.config import settings

logger = logging.getLogger("cyphex.vad")

class VoiceActivityDetector:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VoiceActivityDetector, cls).__new__(cls)
            cls._instance._init_model()
        return cls._instance

    def _init_model(self):
        self.model = None
        self.is_silero_loaded = False
        try:
            model, _ = torch.hub.load(
                repo_or_dir='snakers4/silero-vad',
                model='silero_vad',
                force_reload=False,
                trust_repo=True
            )
            model.eval()
            model.to(settings.MODEL_DEVICE)
            self.model = model
            self.is_silero_loaded = True
            logger.info("Silero VAD loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load Silero VAD from Torch Hub ({e}). Using root-mean-square energy VAD.")
            self.is_silero_loaded = False

    def detect(self, chunk: np.ndarray, sample_rate: int = 16000) -> float:
        if chunk is None or len(chunk) == 0:
            return 0.0

        clean_chunk = np.asarray(chunk, dtype=np.float32).flatten()

        if self.is_silero_loaded and self.model is not None:
            try:
                # Silero VAD expects chunk sizes of 512, 1024, or 1536 samples at 16kHz
                # Process in 512-sample windows and take the maximum speech probability
                silero_chunk_size = 512
                probs = []
                
                with torch.no_grad():
                    for i in range(0, len(clean_chunk), silero_chunk_size):
                        sub_chunk = clean_chunk[i:i + silero_chunk_size]
                        if len(sub_chunk) < silero_chunk_size:
                            sub_chunk = np.pad(sub_chunk, (0, silero_chunk_size - len(sub_chunk)))
                            
                        tensor = torch.from_numpy(sub_chunk).unsqueeze(0).to(settings.MODEL_DEVICE)
                        p = self.model(tensor, sample_rate).item()
                        probs.append(p)

                return float(np.max(probs)) if probs else 0.0
            except Exception as e:
                logger.debug(f"Silero inference issue ({e}), falling back to energy calculation.")

        # Energy-based VAD fallback
        rms = float(np.sqrt(np.mean(clean_chunk ** 2)))
        # Normalize RMS (0.015 is standard vocal threshold)
        prob = min(1.0, rms / 0.03)
        return float(prob)

    def is_speech(self, chunk: np.ndarray, sample_rate: int = 16000, threshold: float = 0.40) -> bool:
        return self.detect(chunk, sample_rate) >= threshold

    def reset(self):
        if self.is_silero_loaded and self.model is not None:
            try:
                self.model.reset_states()
            except Exception:
                pass

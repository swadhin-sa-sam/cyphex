import numpy as np

class VoiceActivityDetector:
    """
    Robust Dual-Threshold Voice Activity Detector (VAD).
    Combines Short-Time Energy and Spectral Zero-Crossing Rate.
    """
    def __init__(self, energy_threshold: float = 0.015, zcr_threshold: float = 0.45):
        self.energy_threshold = energy_threshold
        self.zcr_threshold = zcr_threshold

    def is_speech(self, audio: np.ndarray) -> bool:
        if len(audio) == 0:
            return False

        # 1. Short-Time Energy
        rms = np.sqrt(np.mean(audio ** 2))
        if rms < self.energy_threshold:
            return False

        # 2. Zero-crossing rate
        zcr = np.mean(np.abs(np.diff(np.sign(audio)))) / 2.0
        # Extreme ZCR usually indicates background noise or line hiss, not human voice
        if zcr > self.zcr_threshold:
            return False

        return True

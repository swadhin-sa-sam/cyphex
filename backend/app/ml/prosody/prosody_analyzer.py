import numpy as np
import logging
from dataclasses import dataclass

logger = logging.getLogger("cyphex.prosody")

@dataclass
class ProsodyFeatures:
    local_jitter_pct: float
    local_shimmer_pct: float
    mean_hnr_db: float
    mean_f0_hz: float
    f0_std_hz: float
    f0_contour_smoothness: float
    is_abnormally_smooth: bool
    anomaly_score: float

class ProsodyAnalyzer:
    def analyze(self, audio: np.ndarray, sr: int = 16000) -> ProsodyFeatures:
        default_features = ProsodyFeatures(
            local_jitter_pct=0.0,
            local_shimmer_pct=0.0,
            mean_hnr_db=0.0,
            mean_f0_hz=0.0,
            f0_std_hz=0.0,
            f0_contour_smoothness=0.0,
            is_abnormally_smooth=False,
            anomaly_score=0.0
        )

        if audio is None or len(audio) < int(sr * 0.1):  # At least 100ms
            return default_features

        # Check energy level to skip silence
        rms = float(np.sqrt(np.mean(audio ** 2)))
        if rms < 0.005:
            return default_features

        try:
            import parselmouth
            from parselmouth.praat import call

            audio_f64 = audio.astype(np.float64)
            sound = parselmouth.Sound(audio_f64, sampling_frequency=float(sr))

            # Extract Pitch with defensive try
            try:
                pitch = call(sound, "To Pitch", 0.0, 75.0, 600.0)
                mean_f0 = call(pitch, "Get mean", 0.0, 0.0, "Hertz")
                f0_std = call(pitch, "Get standard deviation", 0.0, 0.0, "Hertz")
                mean_f0 = 0.0 if np.isnan(mean_f0) else float(mean_f0)
                f0_std = 0.0 if np.isnan(f0_std) else float(f0_std)
            except Exception:
                pitch = None
                mean_f0 = 0.0
                f0_std = 0.0

            # Extract PointProcess for Jitter and Shimmer
            local_jitter = 0.0
            local_shimmer = 0.0
            try:
                point_process = call(sound, "To PointProcess (periodic, cc)", 75.0, 600.0)
                local_jitter = call(point_process, "Get jitter (local)", 0.0, 0.0, 0.0001, 0.02, 1.3) * 100.0
                if np.isnan(local_jitter): local_jitter = 0.0
                
                local_shimmer = call([sound, point_process], "Get shimmer (local)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6) * 100.0
                if np.isnan(local_shimmer): local_shimmer = 0.0
            except Exception:
                pass

            # Extract Harmonics-to-Noise Ratio (HNR)
            hnr = 0.0
            try:
                harmonicity = call(sound, "To Harmonicity (cc)", 0.01, 75.0, 0.1, 1.0)
                mean_hnr = call(harmonicity, "Get mean", 0.0, 0.0)
                hnr = 0.0 if np.isnan(mean_hnr) else float(mean_hnr)
            except Exception:
                pass

            # Pitch contour smoothness
            f0_smoothness = 0.0
            if pitch is not None:
                try:
                    pitch_values = pitch.selected_array['frequency']
                    valid_pitch = pitch_values[pitch_values > 0]
                    if len(valid_pitch) > 2:
                        f0_smoothness = float(np.std(np.diff(valid_pitch)))
                except Exception:
                    pass

            # Evaluate TTS vs Human prosody signatures:
            # Neural vocoders often produce unnaturally flat/sterile jitter (< 0.25%) and shimmer (< 0.70%)
            # or abnormally high harmonicity (> 24 dB) on voiced vowels.
            is_abnormally_smooth = (0.0 < local_jitter < 0.25) and (0.0 < local_shimmer < 0.80)
            
            anomaly_score = 0.0
            if 0.0 < local_jitter < 0.30:
                anomaly_score += 0.35
            if 0.0 < local_shimmer < 0.80:
                anomaly_score += 0.35
            if hnr > 24.0:
                anomaly_score += 0.20
            if is_abnormally_smooth:
                anomaly_score += 0.10

            return ProsodyFeatures(
                local_jitter_pct=round(float(local_jitter), 3),
                local_shimmer_pct=round(float(local_shimmer), 3),
                mean_hnr_db=round(float(hnr), 2),
                mean_f0_hz=round(float(mean_f0), 1),
                f0_std_hz=round(float(f0_std), 1),
                f0_contour_smoothness=round(float(f0_smoothness), 2),
                is_abnormally_smooth=is_abnormally_smooth,
                anomaly_score=min(1.0, max(0.0, anomaly_score))
            )
        except Exception as e:
            logger.debug(f"Prosody extraction error on audio window: {e}")
            return default_features

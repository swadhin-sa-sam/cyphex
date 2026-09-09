import numpy as np
import librosa
from dataclasses import dataclass
from app.core.feature_extractor import FeatureExtractor

@dataclass
class SpectralAnalysisResult:
    has_highfreq_cutoff: bool
    cutoff_frequency_hz: float | None
    phase_consistency_score: float
    has_checkerboard_artifacts: bool
    spectral_flatness: float
    anomaly_flags: list[str]
    anomaly_score: float

class SpectralHeuristicAnalyzer:
    def analyze(self, audio: np.ndarray, sr: int = 16000) -> SpectralAnalysisResult:
        flags = []
        score = 0.0

        if audio is None or len(audio) < 512:
            return SpectralAnalysisResult(
                has_highfreq_cutoff=False,
                cutoff_frequency_hz=None,
                phase_consistency_score=1.0,
                has_checkerboard_artifacts=False,
                spectral_flatness=0.0,
                anomaly_flags=[],
                anomaly_score=0.0
            )

        audio_clean = np.asarray(audio, dtype=np.float32).flatten()
        rms = float(np.sqrt(np.mean(audio_clean ** 2)))
        if rms < 0.002:  # Silence
            return SpectralAnalysisResult(
                has_highfreq_cutoff=False,
                cutoff_frequency_hz=None,
                phase_consistency_score=1.0,
                has_checkerboard_artifacts=False,
                spectral_flatness=0.0,
                anomaly_flags=[],
                anomaly_score=0.0
            )

        # 1. High-frequency Cutoff Analysis
        try:
            hf_data = FeatureExtractor.detect_highfreq_cutoff(audio_clean, sr)
            has_cutoff = hf_data.get("has_cutoff", False)
            cutoff_hz = hf_data.get("cutoff_freq_hz")
            if has_cutoff:
                flags.append("HIGH_FREQ_CUTOFF")
                score += 0.35
        except Exception:
            has_cutoff = False
            cutoff_hz = None

        # 2. Spectral Flatness
        try:
            flatness = float(FeatureExtractor.spectral_flatness(audio_clean, sr))
            if np.isnan(flatness): flatness = 0.0
            if flatness < 1e-5:
                flags.append("ABNORMAL_FLATNESS")
                score += 0.15
        except Exception:
            flatness = 0.0

        # 3. Phase Consistency & Derivative
        phase_consistency = 1.0
        try:
            n_fft = min(1024, len(audio_clean))
            hop_length = n_fft // 4
            D = librosa.stft(audio_clean, n_fft=n_fft, hop_length=hop_length)
            phase = np.angle(D)
            if phase.shape[1] > 1:
                phase_diff = np.diff(phase, axis=1)
                std_val = float(np.std(phase_diff))
                if not np.isnan(std_val):
                    phase_consistency = max(0.0, min(1.0, 1.0 - (std_val / np.pi)))
                    if phase_consistency < 0.35:
                        flags.append("POOR_PHASE_COHERENCE")
                        score += 0.25
        except Exception:
            pass

        # 4. Checkerboard / Transposed-Conv Ripple Artifacts
        has_checkerboard = False
        try:
            if 'D' in locals() and D.shape[1] > 2:
                S = np.abs(D)
                envelope = np.mean(S, axis=1)
                env_std = np.std(envelope)
                if env_std > 1e-4:
                    norm_env = (envelope - np.mean(envelope)) / env_std
                    autocorr = np.correlate(norm_env, norm_env, mode='full')
                    autocorr = autocorr[len(autocorr)//2:]
                    if len(autocorr) > 20:
                        peaks = librosa.util.peak_pick(
                            autocorr, pre_max=3, post_max=3, pre_avg=3, post_avg=3, delta=0.15, wait=8
                        )
                        if len(peaks) >= 3:
                            has_checkerboard = True
                            flags.append("CHECKERBOARD_ARTIFACTS")
                            score += 0.25
        except Exception:
            pass

        anomaly_score = min(1.0, max(0.0, score))

        return SpectralAnalysisResult(
            has_highfreq_cutoff=has_cutoff,
            cutoff_frequency_hz=cutoff_hz,
            phase_consistency_score=round(phase_consistency, 3),
            has_checkerboard_artifacts=has_checkerboard,
            spectral_flatness=round(flatness, 6),
            anomaly_flags=flags,
            anomaly_score=round(anomaly_score, 3)
        )

import numpy as np
from scipy import signal
from typing import Dict, Any, Tuple

class AudioFeatureExtractor:
    """
    Unified Audio Feature Extractor for VoiceShield AI.
    Extracts acoustic, spectral, and temporal features from 16kHz PCM audio.
    """
    def __init__(self, sample_rate: int = 16000, n_fft: int = 512, hop_length: int = 160):
        self.sample_rate = sample_rate
        self.n_fft = n_fft
        self.hop_length = hop_length

    def extract_all(self, audio: np.ndarray) -> Dict[str, Any]:
        """
        Extract all features needed for voice authenticity and prosody analysis.
        """
        if len(audio) == 0:
            return self._empty_features()

        audio = audio.astype(np.float32)
        # Normalize
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val

        # 1. Spectral features via STFT
        f, t, Zxx = signal.stft(audio, fs=self.sample_rate, nperseg=self.n_fft, noverlap=self.n_fft - self.hop_length)
        magnitude = np.abs(Zxx)
        power = magnitude ** 2

        # Spectral Centroid
        freq_axis = f[:, np.newaxis]
        total_energy = np.sum(magnitude, axis=0) + 1e-10
        centroid = np.sum(freq_axis * magnitude, axis=0) / total_energy
        mean_centroid = float(np.mean(centroid))

        # Spectral Bandwidth
        deviation = (freq_axis - centroid) ** 2
        bandwidth = np.sqrt(np.sum(deviation * magnitude, axis=0) / total_energy)
        mean_bandwidth = float(np.mean(bandwidth))

        # Spectral Rolloff (85% energy threshold)
        cumsum = np.cumsum(power, axis=0)
        cutoff = 0.85 * cumsum[-1, :]
        rolloff_idx = np.argmax(cumsum >= cutoff, axis=0)
        rolloff = f[rolloff_idx]
        mean_rolloff = float(np.mean(rolloff))

        # High-frequency cutoff check (>7.2 kHz drop, common in neural vocoders)
        hf_energy_ratio = float(np.sum(power[f > 7200, :]) / (np.sum(power) + 1e-10))

        # 2. Time-domain features
        # Zero Crossing Rate
        zcr = np.mean(np.abs(np.diff(np.sign(audio)))) / 2.0

        # RMS Energy
        rms = float(np.sqrt(np.mean(audio ** 2)))

        # 3. Pitch / F0 estimation (Normalized Autocorrelation)
        f0, jitter, shimmer = self._estimate_pitch_and_perturbations(audio)

        # 4. Speaking rate and pause duration
        speaking_rate, pause_ratio = self._estimate_speech_timing(audio, rms)

        return {
            "spectral_centroid": mean_centroid,
            "spectral_bandwidth": mean_bandwidth,
            "spectral_rolloff": mean_rolloff,
            "hf_energy_ratio": hf_energy_ratio,
            "zcr": float(zcr),
            "rms_energy": rms,
            "f0_mean": f0,
            "jitter": jitter,
            "shimmer": shimmer,
            "speaking_rate_syllables_sec": speaking_rate,
            "pause_ratio": pause_ratio,
        }

    def _estimate_pitch_and_perturbations(self, audio: np.ndarray) -> Tuple[float, float, float]:
        """
        Estimate Fundamental Pitch F0 and micro-perturbations (Jitter and Shimmer).
        Synthetic voices typically have unnaturally low jitter (<0.3%) or erratic pitch hops.
        """
        frame_len = int(0.03 * self.sample_rate) # 30ms frames
        hop = int(0.01 * self.sample_rate)      # 10ms hop
        num_frames = (len(audio) - frame_len) // hop

        if num_frames <= 1:
            return 140.0, 0.008, 0.03

        pitch_periods = []
        amplitudes = []

        min_lag = int(self.sample_rate / 400) # Max pitch 400 Hz
        max_lag = int(self.sample_rate / 70)  # Min pitch 70 Hz

        for i in range(num_frames):
            frame = audio[i * hop : i * hop + frame_len]
            # Autocorrelation
            corr = np.correlate(frame, frame, mode='full')
            corr = corr[len(corr)//2:]
            if len(corr) > max_lag:
                peak_idx = min_lag + np.argmax(corr[min_lag:max_lag])
                if corr[peak_idx] > 0.3 * corr[0]: # voiced frame
                    pitch_periods.append(peak_idx)
                    amplitudes.append(np.max(np.abs(frame)))

        if len(pitch_periods) < 4:
            return 140.0, 0.008, 0.03

        periods = np.array(pitch_periods, dtype=np.float32)
        amps = np.array(amplitudes, dtype=np.float32)

        f0 = float(self.sample_rate / (np.mean(periods) + 1e-10))

        # Relative Jitter (period-to-period variability)
        jitter = float(np.mean(np.abs(np.diff(periods))) / (np.mean(periods) + 1e-10))

        # Relative Shimmer (amplitude-to-amplitude variability)
        shimmer = float(np.mean(np.abs(np.diff(amps))) / (np.mean(amps) + 1e-10))

        return f0, jitter, shimmer

    def _estimate_speech_timing(self, audio: np.ndarray, overall_rms: float) -> Tuple[float, float]:
        """
        Estimate speaking rate and pause ratio based on short-term energy envelope.
        """
        frame_size = int(0.02 * self.sample_rate)
        if len(audio) < frame_size * 2:
            return 3.5, 0.15

        frames = np.array([
            np.sqrt(np.mean(audio[i : i + frame_size] ** 2))
            for i in range(0, len(audio) - frame_size, frame_size)
        ])

        threshold = max(0.01, overall_rms * 0.25)
        voiced_frames = frames > threshold
        pause_ratio = float(1.0 - (np.sum(voiced_frames) / max(1, len(frames))))

        # Approximate syllable rate (energy envelope peaks)
        peaks, _ = signal.find_peaks(frames, height=threshold, distance=max(1, int(0.15 * (self.sample_rate / frame_size))))
        duration_sec = len(audio) / self.sample_rate
        speaking_rate = float(len(peaks) / max(0.5, duration_sec))

        return speaking_rate, pause_ratio

    def _empty_features(self) -> Dict[str, Any]:
        return {
            "spectral_centroid": 1500.0,
            "spectral_bandwidth": 1800.0,
            "spectral_rolloff": 3200.0,
            "hf_energy_ratio": 0.05,
            "zcr": 0.05,
            "rms_energy": 0.01,
            "f0_mean": 130.0,
            "jitter": 0.008,
            "shimmer": 0.03,
            "speaking_rate_syllables_sec": 3.2,
            "pause_ratio": 0.2,
        }

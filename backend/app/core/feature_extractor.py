import numpy as np
import librosa
import torch

class FeatureExtractor:
    _lfcc_transform = None

    @classmethod
    def extract_lfcc(cls, audio: np.ndarray, sr: int = 16000) -> np.ndarray:
        clean_audio = np.asarray(audio, dtype=np.float32).flatten()
        waveform = torch.from_numpy(clean_audio).unsqueeze(0)
        
        try:
            import torchaudio
            if cls._lfcc_transform is None:
                cls._lfcc_transform = torchaudio.transforms.LFCC(
                    sample_rate=sr,
                    n_filter=20,
                    n_lfcc=20
                )
            lfcc = cls._lfcc_transform(waveform)
            return lfcc.squeeze(0).detach().cpu().numpy()
        except Exception:
            # Fallback to librosa MFCC if torchaudio LFCC is unavailable
            mfcc = librosa.feature.mfcc(y=clean_audio, sr=sr, n_mfcc=20)
            return mfcc

    @staticmethod
    def extract_stft(audio: np.ndarray, sr: int = 16000) -> tuple[np.ndarray, np.ndarray]:
        clean_audio = np.asarray(audio, dtype=np.float32).flatten()
        n_fft = min(1024, len(clean_audio))
        D = librosa.stft(clean_audio, n_fft=n_fft)
        magnitude = np.abs(D)
        phase = np.angle(D)
        return magnitude, phase

    @staticmethod
    def spectral_rolloff(audio: np.ndarray, sr: int = 16000) -> float:
        clean_audio = np.asarray(audio, dtype=np.float32).flatten()
        if len(clean_audio) < 128:
            return 0.0
        n_fft = min(1024, len(clean_audio))
        rolloff = librosa.feature.spectral_rolloff(y=clean_audio, sr=sr, n_fft=n_fft, roll_percent=0.85)
        return float(np.mean(rolloff))

    @staticmethod
    def spectral_flatness(audio: np.ndarray, sr: int = 16000) -> float:
        clean_audio = np.asarray(audio, dtype=np.float32).flatten()
        if len(clean_audio) < 128:
            return 0.0
        n_fft = min(1024, len(clean_audio))
        flatness = librosa.feature.spectral_flatness(y=clean_audio, n_fft=n_fft)
        return float(np.mean(flatness))

    @staticmethod
    def detect_highfreq_cutoff(audio: np.ndarray, sr: int = 16000, cutoff_db_drop: float = 40.0) -> dict:
        clean_audio = np.asarray(audio, dtype=np.float32).flatten()
        if len(clean_audio) < 512:
            return {"has_cutoff": False, "energy_ratio_db": 0.0, "cutoff_freq_hz": float(sr / 2)}

        nyquist = sr / 2.0
        n_fft = min(1024, len(clean_audio))
        S = np.abs(librosa.stft(clean_audio, n_fft=n_fft))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
        
        energy = np.sum(S ** 2, axis=1)
        
        mid_band = (freqs >= nyquist * 0.25) & (freqs < nyquist * 0.50)
        high_band = (freqs >= nyquist * 0.75) & (freqs <= nyquist)
        
        mid_energy = float(np.sum(energy[mid_band])) + 1e-10
        high_energy = float(np.sum(energy[high_band])) + 1e-10
        
        energy_ratio_db = float(10.0 * np.log10(mid_energy / high_energy))
        has_cutoff = bool(energy_ratio_db > cutoff_db_drop)
        
        cutoff_freq_hz = float(nyquist)
        for i in range(len(freqs) - 1, 0, -1):
            denom = float(energy[i]) + 1e-10
            numer = float(energy[i - 1]) + 1e-10
            if 10.0 * np.log10(numer / denom) > 12.0:
                cutoff_freq_hz = float(freqs[i])
                break

        return {
            "has_cutoff": has_cutoff,
            "energy_ratio_db": round(energy_ratio_db, 2),
            "cutoff_freq_hz": round(cutoff_freq_hz, 1)
        }

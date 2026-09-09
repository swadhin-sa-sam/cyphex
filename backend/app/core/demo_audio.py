import numpy as np
import struct
import io
import wave
from typing import Tuple

def generate_carrier_tone(
    duration_s: float = 0.25,
    sample_rate: int = 16000,
    threat_type: str = "GENUINE_CALL",
    time_offset: float = 0.0
) -> Tuple[bytes, np.ndarray]:
    """
    Generates realistic 16-bit Linear PCM audio chunks (and float32 numpy array)
    modeling the acoustic and spectral properties of genuine vs deepfake voices.
    """
    num_samples = int(duration_s * sample_rate)
    t = np.linspace(time_offset, time_offset + duration_s, num_samples, endpoint=False)

    if threat_type == "CEO_CLONE":
        # Artificial robotic pitch: perfectly flat f0 = 130 Hz without natural human micro-jitter
        f0 = 130.0
        # Formants (Vowel-like resonance)
        harmonics = [1.0, 0.7, 0.45, 0.3, 0.15, 0.08, 0.04]
        signal = np.zeros(num_samples)
        for idx, amp in enumerate(harmonics, start=1):
            signal += amp * np.sin(2 * np.pi * (f0 * idx) * t)

        # Brickwall cutoff: zero energy above 7.0 kHz (neural vocoder upsampling artifact)
        fft = np.fft.rfft(signal)
        freqs = np.fft.rfftfreq(num_samples, 1.0 / sample_rate)
        fft[freqs > 7000] = 0.0
        signal = np.fft.irfft(fft, n=num_samples)

        # Flat modulation
        signal *= 0.65 * (0.85 + 0.15 * np.sin(2 * np.pi * 3.5 * t))

    elif threat_type == "VOCODER_CUTOFF":
        # Multi-band synthetic speech with phase checkerboarding
        f0 = 145.0
        signal = np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * 2 * f0 * t) + 0.3 * np.sin(2 * np.pi * 3 * f0 * t)
        # Lowpass filter strictly at 6.8 kHz
        fft = np.fft.rfft(signal)
        freqs = np.fft.rfftfreq(num_samples, 1.0 / sample_rate)
        fft[freqs > 6800] = 0.0
        signal = np.fft.irfft(fft, n=num_samples)
        signal *= 0.60

    else:
        # Genuine human speech: natural micro-jitter (1.2%) and shimmer (2.5%)
        jitter_mod = 1.0 + 0.015 * np.sin(2 * np.pi * 28.0 * t)
        f0_instantaneous = 120.0 * jitter_mod
        phase = 2 * np.pi * np.cumsum(f0_instantaneous) / sample_rate

        # Natural human vowel formants (F1=700Hz, F2=1200Hz, F3=2500Hz)
        signal = (
            0.50 * np.sin(phase) +
            0.35 * np.sin(2 * phase) +
            0.25 * np.sin(3 * phase) +
            0.15 * np.sin(6 * phase) +
            0.08 * np.sin(10 * phase)
        )
        # Natural broad-spectrum aspiration noise (HNR ~18dB)
        noise = np.random.normal(0, 0.02, num_samples)
        signal += noise
        # Full unconstrained bandwidth up to Nyquist (8 kHz)
        signal *= 0.70 * (0.8 + 0.2 * np.sin(2 * np.pi * 2.0 * t))

    # Normalize to -1.0 .. 1.0 range
    max_val = np.max(np.abs(signal)) + 1e-9
    float_samples = np.clip(signal / max_val * 0.85, -1.0, 1.0).astype(np.float32)

    # Convert to 16-bit Signed Linear PCM Bytes
    int_samples = (float_samples * 32767).astype(np.int16)
    pcm_bytes = int_samples.tobytes()

    return pcm_bytes, float_samples

def generate_scenario_wav(threat_type: str = "CEO_CLONE", duration_s: float = 6.0) -> bytes:
    """
    Builds a complete playable WAV file in memory for browser audio playback during the demo.
    """
    sample_rate = 16000
    chunk_dur = 0.25
    chunks_count = int(duration_s / chunk_dur)

    all_pcm = bytearray()
    for c in range(chunks_count):
        chunk_bytes, _ = generate_carrier_tone(
            duration_s=chunk_dur,
            sample_rate=sample_rate,
            threat_type=threat_type,
            time_offset=c * chunk_dur
        )
        all_pcm.extend(chunk_bytes)

    # Wrap in standard RIFF WAV format
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(all_pcm)

    return buf.getvalue()

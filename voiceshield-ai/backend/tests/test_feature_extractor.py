import pytest
import numpy as np
from app.core.audio_features import AudioFeatureExtractor
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pwd = "VoiceShieldSecure#2026"
    hashed = get_password_hash(pwd)
    assert hashed.startswith("pbkdf2_sha256$100000$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token():
    payload = {"sub": "user-123", "role": "EMPLOYEE"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-123"
    assert decoded["role"] == "EMPLOYEE"

def test_audio_feature_extractor():
    extractor = AudioFeatureExtractor()
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    # 200 Hz tone + harmonics
    audio = 0.5 * np.sin(2 * np.pi * 200 * t) + 0.25 * np.sin(2 * np.pi * 400 * t)
    features = extractor.extract_all(audio)

    assert "spectral_centroid" in features
    assert "jitter" in features
    assert "shimmer" in features
    assert "rms_energy" in features
    assert features["rms_energy"] > 0.0

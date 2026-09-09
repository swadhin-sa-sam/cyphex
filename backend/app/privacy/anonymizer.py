import hashlib
import json
import numpy as np

class DataAnonymizer:
    @staticmethod
    def extract_features_only(audio: np.ndarray) -> dict:
        return {
            "mean_energy": float(np.mean(np.abs(audio))),
            "zero_crossings": int(np.sum(np.abs(np.diff(np.signbit(audio))))),
        }

    @staticmethod
    def hash_features(features: dict) -> str:
        s = json.dumps(features, sort_keys=True)
        return hashlib.sha256(s.encode('utf-8')).hexdigest()

    @staticmethod
    def log_anonymized(session_id: str, features: dict):
        pass

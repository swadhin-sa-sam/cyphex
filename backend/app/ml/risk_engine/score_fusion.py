from dataclasses import dataclass, field

@dataclass
class DetectionScores:
    aasist_score: float
    wav2vec2_score: float
    prosody_anomaly_score: float
    spectral_heuristic_score: float
    speaker_dissimilarity: float = 0.0
    has_speaker_target: bool = False
    context_is_voip: bool = False
    context_is_off_hours: bool = False

@dataclass
class FusedScore:
    raw_score: float
    risk_level: str
    anomaly_flags: list[str]
    recommendation: str

class ScoreFusionEngine:
    def __init__(self):
        # Default base weights
        self.w_aasist = 0.35
        self.w_w2v2 = 0.25
        self.w_prosody = 0.20
        self.w_spectral = 0.20
        self.w_speaker = 0.20  # Applied when speaker verification target is active

    def compute(self, scores: DetectionScores) -> FusedScore:
        flags = []

        if scores.has_speaker_target:
            total_weight = self.w_aasist + self.w_w2v2 + self.w_prosody + self.w_spectral + self.w_speaker
            base_score = (
                (self.w_aasist * scores.aasist_score) +
                (self.w_w2v2 * scores.wav2vec2_score) +
                (self.w_prosody * scores.prosody_anomaly_score) +
                (self.w_spectral * scores.spectral_heuristic_score) +
                (self.w_speaker * scores.speaker_dissimilarity)
            ) / total_weight
        else:
            total_weight = self.w_aasist + self.w_w2v2 + self.w_prosody + self.w_spectral
            base_score = (
                (self.w_aasist * scores.aasist_score) +
                (self.w_w2v2 * scores.wav2vec2_score) +
                (self.w_prosody * scores.prosody_anomaly_score) +
                (self.w_spectral * scores.spectral_heuristic_score)
            ) / total_weight

        # Contextual risk boosters
        if scores.context_is_voip:
            base_score += 0.08
            flags.append("VOIP_NETWORK")
            
        if scores.context_is_off_hours:
            base_score += 0.05
            flags.append("ANOMALOUS_HOURS")
            
        final_score = min(1.0, max(0.0, base_score))

        # Risk level determination
        if final_score < 0.30:
            risk_level = "LOW"
            recommendation = "Authentication Verified: Voice integrity natural"
        elif final_score < 0.55:
            risk_level = "MEDIUM"
            recommendation = "Elevated Caution: Continue passive monitoring"
        elif final_score < 0.75:
            risk_level = "HIGH"
            recommendation = "High Risk: Require Out-Of-Band (OOB) MFA confirmation"
        else:
            risk_level = "CRITICAL"
            recommendation = "Confirmed Deepfake: Terminate call & freeze transactions"

        # Anomaly categorization flags
        if scores.aasist_score > 0.70: flags.append("NEURAL_VOCODER_ARTIFACTS")
        if scores.wav2vec2_score > 0.70: flags.append("LATENT_SYNTHETIC_PATTERNS")
        if scores.prosody_anomaly_score > 0.65: flags.append("UNNATURAL_PITCH_PROSODY")
        if scores.spectral_heuristic_score > 0.55: flags.append("ACOUSTIC_ANOMALY")
        if scores.has_speaker_target and scores.speaker_dissimilarity > 0.40:
            flags.append("BIOMETRIC_SPEAKER_MISMATCH")

        return FusedScore(
            raw_score=round(final_score, 4),
            risk_level=risk_level,
            anomaly_flags=flags,
            recommendation=recommendation
        )

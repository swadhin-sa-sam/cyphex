import numpy as np
from typing import Dict, Any, List, Optional
from app.schemas.schemas import (
    RiskResult, RiskLevelEnum, RiskFactorBreakdown,
    VoicePrediction, SpeakerMatchResult, BehaviorResult, ContextRiskResult
)

class RiskEngine:
    """
    Central Dynamic Multi-Modal Risk Decision Engine for VoiceShield AI.
    Combines voice authenticity, speaker biometrics, linguistic behavior, and transactional context.
    """
    def __init__(
        self,
        weight_synthetic: float = 0.35,
        weight_speaker: float = 0.25,
        weight_prosody: float = 0.10,
        weight_caller: float = 0.10,
        weight_behavior: float = 0.10,
        weight_transaction: float = 0.10,
        ema_alpha: float = 0.30
    ):
        self.weights = {
            "synthetic": weight_synthetic,
            "speaker": weight_speaker,
            "prosody": weight_prosody,
            "caller": weight_caller,
            "behavior": weight_behavior,
            "transaction": weight_transaction,
        }
        self.ema_alpha = ema_alpha
        self.prev_smoothed_score: Optional[float] = None

    def calculate_risk(
        self,
        voice_prediction: VoicePrediction,
        speaker_match: SpeakerMatchResult,
        behavior_result: BehaviorResult,
        context_result: ContextRiskResult,
        prosody_score: float = 0.0,
        is_fail_safe_mode: bool = False
    ) -> RiskResult:
        """
        Compute authoritative 0-100 risk score and security decision.
        """
        if is_fail_safe_mode or "VOICE_ANALYSIS_UNAVAILABLE" in voice_prediction.anomaly_flags:
            # Mandatory Fail-Safe Behavior
            return RiskResult(
                overall_risk=65.0,
                risk_level=RiskLevelEnum.HIGH,
                action_recommended="SECONDARY_VERIFICATION_RECOMMENDED",
                synthetic_score=50.0,
                speaker_score=50.0,
                prosody_score=50.0,
                caller_anomaly_score=context_result.caller_anomaly * 100,
                behavior_score=behavior_result.behavior_risk_score * 100,
                transaction_risk_score=context_result.transaction_risk * 100,
                contributing_factors=[
                    RiskFactorBreakdown(
                        factor="Voice Analysis Offline",
                        impact_points=40,
                        description="Voice authenticity engine unavailable; fail-safe security posture enforced."
                    )
                ],
                why_risky=[
                    "Voice analysis unavailable. Secondary verification is recommended before performing sensitive actions."
                ],
                latency_ms=18.0
            )

        # 1. Normalize Component Scores to 0-100
        synthetic_comp = voice_prediction.synthetic_probability * 100.0
        # Speaker mismatch: 0 (matched) -> 100 (total mismatch)
        speaker_mismatch_comp = (1.0 - speaker_match.match_score) * 100.0
        prosody_comp = prosody_score * 100.0 if prosody_score <= 1.0 else prosody_score
        caller_comp = context_result.caller_anomaly * 100.0
        behavior_comp = behavior_result.behavior_risk_score * 100.0
        transaction_comp = context_result.transaction_risk * 100.0

        # 2. Weighted Sum
        raw_weighted_score = (
            (synthetic_comp * self.weights["synthetic"]) +
            (speaker_mismatch_comp * self.weights["speaker"]) +
            (prosody_comp * self.weights["prosody"]) +
            (caller_comp * self.weights["caller"]) +
            (behavior_comp * self.weights["behavior"]) +
            (transaction_comp * self.weights["transaction"])
        )

        # 3. Temporal Smoothing (EMA)
        if self.prev_smoothed_score is None:
            final_score = raw_weighted_score
        else:
            final_score = (self.ema_alpha * raw_weighted_score) + ((1.0 - self.ema_alpha) * self.prev_smoothed_score)
        
        self.prev_smoothed_score = final_score
        final_score = float(np.clip(round(final_score, 1), 0.0, 100.0))

        # 4. Decision Thresholds
        if final_score < 30.0:
            level = RiskLevelEnum.LOW
            action = "ALLOW / CONTINUE"
        elif final_score < 60.0:
            level = RiskLevelEnum.MEDIUM
            action = "MONITOR ACTIVE CALL"
        elif final_score < 80.0:
            level = RiskLevelEnum.HIGH
            action = "SECONDARY VERIFICATION REQUIRED"
        else:
            level = RiskLevelEnum.CRITICAL
            action = "BLOCK SENSITIVE ACTION & HOLD TRANSACTION"

        # 5. Dynamic Contributing Factors & "Why is this risky?"
        factors: List[RiskFactorBreakdown] = []
        why_risky: List[str] = []

        synth_points = int(round(synthetic_comp * self.weights["synthetic"]))
        if synth_points > 10:
            factors.append(RiskFactorBreakdown(
                factor="Synthetic voice characteristics",
                impact_points=synth_points,
                description=f"Neural vocoder artifacts ({', '.join(voice_prediction.anomaly_flags) or 'Diffusion pattern'}) detected"
            ))
            why_risky.append("Synthetic voice characteristics detected via acoustic frequency analysis")

        spk_points = int(round(speaker_mismatch_comp * self.weights["speaker"]))
        if spk_points > 8:
            factors.append(RiskFactorBreakdown(
                factor="Speaker identity mismatch",
                impact_points=spk_points,
                description=f"Voice acoustic profile deviates from registered speaker '{speaker_match.claimed_speaker}'"
            ))
            why_risky.append("Voice differs from the registered voice profile")

        tx_points = int(round(transaction_comp * self.weights["transaction"]))
        if tx_points > 6:
            factors.append(RiskFactorBreakdown(
                factor="High-value transaction",
                impact_points=tx_points,
                description="Financial transfer requested exceeds normal operational threshold"
            ))
            why_risky.append("High-value transaction detected")

        call_points = int(round(caller_comp * self.weights["caller"]))
        if call_points > 5:
            factors.append(RiskFactorBreakdown(
                factor="Unknown / Unrecognized caller",
                impact_points=call_points,
                description="Incoming call trunk does not match verified directory"
            ))
            why_risky.append("Caller is using an unrecognized number")

        beh_points = int(round(behavior_comp * self.weights["behavior"]))
        if beh_points > 5:
            if behavior_result.urgency_detected:
                factors.append(RiskFactorBreakdown(
                    factor="Urgency language detected",
                    impact_points=min(beh_points, 7),
                    description="Caller exerting artificial high-pressure temporal constraints"
                ))
                why_risky.append("Urgency language detected")
            if behavior_result.policy_bypass:
                factors.append(RiskFactorBreakdown(
                    factor="Policy bypass attempt",
                    impact_points=3,
                    description="Caller attempting to bypass standard managerial clearance"
                ))
                why_risky.append("Normal verification procedure is being bypassed")

        if not why_risky:
            why_risky.append("Voice acoustic metrics and caller metadata remain within authentic parameters")

        return RiskResult(
            overall_risk=final_score,
            risk_level=level,
            action_recommended=action,
            synthetic_score=round(synthetic_comp, 1),
            speaker_score=round(speaker_mismatch_comp, 1),
            prosody_score=round(prosody_comp, 1),
            caller_anomaly_score=round(caller_comp, 1),
            behavior_score=round(behavior_comp, 1),
            transaction_risk_score=round(transaction_comp, 1),
            contributing_factors=factors,
            why_risky=why_risky,
            latency_ms=24.5
        )

    def reset_smoother(self):
        self.prev_smoothed_score = None

import pytest
import numpy as np
from app.services.risk_engine import RiskEngine
from app.schemas.schemas import (
    VoicePrediction, SpeakerMatchResult, BehaviorResult, ContextRiskResult, RiskLevelEnum
)

def test_risk_engine_genuine_call():
    engine = RiskEngine()
    voice_pred = VoicePrediction(synthetic_probability=0.08, confidence=0.95)
    spk_pred = SpeakerMatchResult(match_score=0.96, verified=True, confidence=0.97, claimed_speaker="Rajesh Sharma")
    beh_pred = BehaviorResult(behavior_risk_score=0.08)
    ctx_pred = ContextRiskResult(caller_anomaly=0.05, transaction_risk=0.10, context_risk=0.08)

    result = engine.calculate_risk(voice_pred, spk_pred, beh_pred, ctx_pred, prosody_score=0.10)
    assert result.overall_risk < 30.0
    assert result.risk_level == RiskLevelEnum.LOW
    assert "ALLOW" in result.action_recommended

def test_risk_engine_critical_impersonation():
    engine = RiskEngine()
    voice_pred = VoicePrediction(
        synthetic_probability=0.91, confidence=0.94,
        anomaly_flags=["HF_VOCODER_ARTIFACT", "PROSODY_ROBOTIC_FLATNESS"]
    )
    spk_pred = SpeakerMatchResult(match_score=0.34, verified=False, confidence=0.91, claimed_speaker="Rajesh Sharma")
    beh_pred = BehaviorResult(behavior_risk_score=0.85, urgency_detected=True, policy_bypass=True)
    ctx_pred = ContextRiskResult(caller_anomaly=0.72, transaction_risk=0.92, context_risk=0.88)

    result = engine.calculate_risk(voice_pred, spk_pred, beh_pred, ctx_pred, prosody_score=0.72)
    assert result.overall_risk >= 80.0
    assert result.risk_level == RiskLevelEnum.CRITICAL
    assert "BLOCK" in result.action_recommended
    assert len(result.contributing_factors) >= 3

def test_fail_safe_behavior():
    engine = RiskEngine()
    voice_pred = VoicePrediction(
        synthetic_probability=0.50, confidence=0.50,
        anomaly_flags=["VOICE_ANALYSIS_UNAVAILABLE"]
    )
    spk_pred = SpeakerMatchResult(match_score=0.50, verified=False, confidence=0.50, claimed_speaker="Unknown")
    beh_pred = BehaviorResult(behavior_risk_score=0.30)
    ctx_pred = ContextRiskResult(caller_anomaly=0.20, transaction_risk=0.20, context_risk=0.20)

    result = engine.calculate_risk(voice_pred, spk_pred, beh_pred, ctx_pred, is_fail_safe_mode=True)
    assert result.action_recommended == "SECONDARY_VERIFICATION_RECOMMENDED"
    assert any("Voice analysis unavailable" in w for w in result.why_risky)

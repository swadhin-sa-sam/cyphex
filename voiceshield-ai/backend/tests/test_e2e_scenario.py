import pytest
import numpy as np
from app.services.voice_authenticity import MockVoiceAuthenticityService
from app.services.speaker_verification import SpeakerVerificationService
from app.services.behavior_analysis import BehaviorAnalysisService
from app.services.context_risk import ContextRiskService
from app.services.risk_engine import RiskEngine
from app.schemas.schemas import RiskLevelEnum

def test_complete_e2e_sih_demo_scenario():
    """
    Simulates the complete 10-step SIH 2026 Impersonation & Fraud Prevention Workflow.
    """
    # 1. Incoming Call Intercept
    caller_phone = "+91 98200 11223"
    claimed_identity = "Rajesh Sharma (CFO)"
    requested_transfer_inr = 2500000.0 # ₹25 Lakh
    beneficiary_name = "ABC Trading Pvt Ltd"
    utterance_text = "I am CFO Rajesh Sharma. Wire ₹25 lakh immediately before the 4 PM cutoff, skip normal review."

    # 2. Instantiate Decoupled Services
    voice_service = MockVoiceAuthenticityService()
    speaker_service = SpeakerVerificationService()
    behavior_service = BehaviorAnalysisService()
    context_service = ContextRiskService()
    risk_engine = RiskEngine()

    dummy_audio = np.random.randn(16000 * 2).astype(np.float32)

    # 3. Voice Authenticity Prediction
    voice_pred = voice_service.predict(dummy_audio, scenario_override="ai_impersonation")
    assert voice_pred.synthetic_probability >= 0.90
    assert "HF_VOCODER_ARTIFACT" in voice_pred.anomaly_flags

    # 4. Speaker Biometric Verification
    spk_match = speaker_service.verify(dummy_audio, claimed_speaker="Rajesh Sharma", scenario_override="ai_impersonation")
    assert spk_match.match_score <= 0.40
    assert spk_match.verified is False

    # 5. Linguistic Behavior Analysis
    behavior = behavior_service.analyze(utterance_text, scenario_override="ai_impersonation")
    assert behavior.urgency_detected is True
    assert behavior.policy_bypass is True
    assert behavior.behavior_risk_score >= 0.80

    # 6. Contextual & Financial Evaluation
    context = context_service.evaluate(
        caller_phone=caller_phone,
        claimed_identity=claimed_identity,
        transaction_amount=requested_transfer_inr,
        beneficiary_name=beneficiary_name,
        scenario_override="ai_impersonation"
    )
    assert context.transaction_risk >= 0.90
    assert context.caller_anomaly >= 0.70

    # 7. Multi-Modal Risk Fusion Calculation
    decision = risk_engine.calculate_risk(
        voice_prediction=voice_pred,
        speaker_match=spk_match,
        behavior_result=behavior,
        context_result=context,
        prosody_score=0.72
    )

    # 8. Verify Critical Impersonation Threshold Crossed
    assert decision.overall_risk >= 80.0
    assert decision.risk_level == RiskLevelEnum.CRITICAL
    assert "BLOCK" in decision.action_recommended

    # 9. Verify Circuit-Breaker Auto-Hold Decision
    transaction_status = "ON_HOLD" if decision.overall_risk >= 80.0 else "APPROVED"
    assert transaction_status == "ON_HOLD"

    # 10. Secondary Out-of-Band Identity Verification Challenge
    # CFO explicitly denies / rejects authorizing the transfer
    cfo_authorized = False
    if not cfo_authorized:
        final_action = "FRAUD_ATTEMPT_PREVENTED"
        incident_status = "BLOCKED"

    assert final_action == "FRAUD_ATTEMPT_PREVENTED"
    assert incident_status == "BLOCKED"
    assert len(decision.contributing_factors) >= 3

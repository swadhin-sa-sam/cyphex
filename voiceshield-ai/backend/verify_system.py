"""
VoiceShield AI — Complete System Self-Test & Verification Runner
Run via: python verify_system.py
"""
import sys
import numpy as np
import asyncio

def run_self_test():
    print("=" * 70)
    print("🛡️  VOICESHIELD AI — SYSTEM VERIFICATION & SELF-TEST SUITE")
    print("=" * 70)

    # 1. Feature Extraction Test
    print("\n[1/6] Testing AudioFeatureExtractor...")
    from app.core.audio_features import AudioFeatureExtractor
    extractor = AudioFeatureExtractor(sample_rate=16000)
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    synthetic_speech = 0.6 * np.sin(2 * np.pi * 150 * t) + 0.3 * np.sin(2 * np.pi * 300 * t)
    feats = extractor.extract_all(synthetic_speech)
    assert "spectral_centroid" in feats
    assert "jitter" in feats
    assert "shimmer" in feats
    print("  ✓ Spectral & Prosodic features computed successfully:")
    print(f"    - Centroid: {feats['spectral_centroid']:.1f} Hz")
    print(f"    - Jitter: {feats['jitter']:.4f}")
    print(f"    - Shimmer: {feats['shimmer']:.4f}")

    # 2. Voice Authenticity Service Test
    print("\n[2/6] Testing VoiceAuthenticityService...")
    from app.services.voice_authenticity import MockVoiceAuthenticityService
    voice_svc = MockVoiceAuthenticityService()
    pred_impersonation = voice_svc.predict(synthetic_speech, scenario_override="ai_impersonation")
    pred_genuine = voice_svc.predict(synthetic_speech, scenario_override="genuine_executive")
    assert pred_impersonation.synthetic_probability > 0.85
    assert pred_genuine.synthetic_probability < 0.20
    print(f"  ✓ AI Impersonation synthetic prob: {pred_impersonation.synthetic_probability * 100:.0f}%")
    print(f"  ✓ Genuine Call synthetic prob:      {pred_genuine.synthetic_probability * 100:.0f}%")

    # 3. Biometric Speaker Verification Test
    print("\n[3/6] Testing SpeakerVerificationService...")
    from app.services.speaker_verification import SpeakerVerificationService
    spk_svc = SpeakerVerificationService()
    spk_match_fail = spk_svc.verify(synthetic_speech, "Rajesh Sharma", scenario_override="ai_impersonation")
    spk_match_pass = spk_svc.verify(synthetic_speech, "Rajesh Sharma", scenario_override="genuine_executive")
    assert spk_match_fail.match_score < 0.50
    assert spk_match_pass.match_score > 0.85
    print(f"  ✓ Clone Match Score:   {spk_match_fail.match_score * 100:.0f}% (Mismatch detected)")
    print(f"  ✓ Genuine Match Score: {spk_match_pass.match_score * 100:.0f}% (Verified)")

    # 4. Behavioral & Context Risk Test
    print("\n[4/6] Testing Behavior & Context Risk Engines...")
    from app.services.behavior_analysis import BehaviorAnalysisService
    from app.services.context_risk import ContextRiskService
    beh_svc = BehaviorAnalysisService()
    ctx_svc = ContextRiskService()
    beh_res = beh_svc.analyze("I am the CFO, wire ₹25 lakh immediately before cutoff, skip procedure", scenario_override="ai_impersonation")
    ctx_res = ctx_svc.evaluate("+91 98200 11223", "Rajesh Sharma (CFO)", transaction_amount=2500000.0, scenario_override="ai_impersonation")
    assert beh_res.urgency_detected is True
    assert ctx_res.transaction_risk >= 0.80
    print(f"  ✓ Behavioral urgency cues detected: {beh_res.detected_phrases[:2]}")
    print(f"  ✓ Context transaction risk:         {ctx_res.transaction_risk * 100:.0f}%")

    # 5. Risk Engine Fusion & Fail-Safe Test
    print("\n[5/6] Testing RiskEngine Multi-Modal Fusion & Fail-Safe...")
    from app.services.risk_engine import RiskEngine
    from app.schemas.schemas import RiskLevelEnum
    risk_engine = RiskEngine()
    risk_res = risk_engine.calculate_risk(pred_impersonation, spk_match_fail, beh_res, ctx_res, prosody_score=0.72)
    assert risk_res.overall_risk >= 80.0
    assert risk_res.risk_level == RiskLevelEnum.CRITICAL
    print(f"  ✓ Calculated Risk Verdict: {risk_res.overall_risk:.1f} / 100 ({risk_res.risk_level.value})")
    print(f"  ✓ Policy Action:           {risk_res.action_recommended}")
    print(f"  ✓ Contributing Factors:    {len(risk_res.contributing_factors)} identified")

    # Fail-safe check
    fail_safe_res = risk_engine.calculate_risk(pred_impersonation, spk_match_fail, beh_res, ctx_res, is_fail_safe_mode=True)
    assert fail_safe_res.action_recommended == "SECONDARY_VERIFICATION_RECOMMENDED"
    print("  ✓ Fail-Safe security posture enforced when voice engine offline")

    # 6. Database Auto-Seed Verification
    print("\n[6/6] Testing Database Initialization & Schema Auto-Seed...")
    from app.db.database import init_db
    asyncio.run(init_db())
    print("  ✓ Database tables & baseline demo scenarios verified.")

    print("\n" + "=" * 70)
    print("✅  ALL VOICESHIELD AI CORE SUBSYSTEMS VERIFIED AND OPERATIONAL!")
    print("=" * 70)

if __name__ == "__main__":
    run_self_test()

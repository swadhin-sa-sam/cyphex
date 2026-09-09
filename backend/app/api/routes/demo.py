from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List
from app.core.demo_audio import generate_scenario_wav

router = APIRouter(prefix="/demo", tags=["Live-Call Attack Simulator"])

class ScenarioInfo(BaseModel):
    id: str
    title: str
    description: str
    threat_type: str
    target_role: str
    expected_score: float
    expected_verdict: str
    duration_s: float
    simulated_transcript: str

SCENARIOS: List[ScenarioInfo] = [
    ScenarioInfo(
        id="ceo_wire_fraud",
        title="CEO Voice Clone — Urgent Wire Transfer Attack",
        description="Threat actor cloned the CEO's voice from a 15-second earnings call clip using neural VALL-E/XTTS synthesis, demanding an immediate $250,000 offshore wire transfer to bypass dual-authorization.",
        threat_type="CEO_CLONE",
        target_role="Chief Executive Officer",
        expected_score=0.94,
        expected_verdict="CRITICAL RISK — IMMEDIATE STEP-UP AUTH",
        duration_s=8.0,
        simulated_transcript='"Hey David, I\'m boarding a flight right now. You need to release that $250,000 invoice for the Singapore vendor immediately. Do not wait for standard sign-off."'
    ),
    ScenarioInfo(
        id="neural_vocoder_attack",
        title="HiFi-GAN Vocoder — Spectral Lowpass Truncation",
        description="Automated social engineering bot calling customer support using FastSpeech2 + HiFi-GAN. Demonstrates clear high-frequency shelf drop at 7.2 kHz and unnatural pitch stability.",
        threat_type="VOCODER_CUTOFF",
        target_role="External Vendor",
        expected_score=0.88,
        expected_verdict="HIGH RISK — SYNTHETIC ARTIFACTS",
        duration_s=6.0,
        simulated_transcript='"Hello, I am calling regarding my vendor account credentials. My two-factor device was misplaced and I need an urgent password reset."'
    ),
    ScenarioInfo(
        id="genuine_executive_call",
        title="Verified Authentic Caller — Genuine Speech Dynamics",
        description="Authentic human speech with natural micro-pitch variations (Jitter 1.2%), natural room reverberation, and unconstrained high-frequency acoustic spectrum up to 8.0 kHz.",
        threat_type="GENUINE_CALL",
        target_role="Chief Technology Officer",
        expected_score=0.08,
        expected_verdict="AUTHENTIC VOICE — VERIFIED GENUINE",
        duration_s=6.0,
        simulated_transcript='"Good afternoon team, just confirming our SOC architecture review meeting for tomorrow morning at 10 AM. All systems look good."'
    ),
]

@router.get("/scenarios", response_model=List[ScenarioInfo])
async def get_scenarios():
    """
    Returns pre-configured attack and genuine scenarios for hackathon demonstrations.
    """
    return SCENARIOS

@router.get("/audio/{scenario_id}")
async def get_scenario_audio(scenario_id: str):
    """
    Returns audio WAV for live in-browser playback during demo simulation.
    """
    scenario = next((s for s in SCENARIOS if s.id == scenario_id), None)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    wav_bytes = generate_scenario_wav(threat_type=scenario.threat_type, duration_s=scenario.duration_s)
    return Response(content=wav_bytes, media_type="audio/wav")

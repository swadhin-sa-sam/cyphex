from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.database import get_db
from app.db.models import Call, CallStatus, CallRiskEvent, RiskLevel
from app.schemas.schemas import CallCreate, CallResponse, RiskResult, RiskLevelEnum, RiskFactorBreakdown
from app.services.voice_authenticity import MockVoiceAuthenticityService
from app.services.speaker_verification import SpeakerVerificationService
from app.services.behavior_analysis import BehaviorAnalysisService
from app.services.context_risk import ContextRiskService
from app.services.risk_engine import RiskEngine
import numpy as np

router = APIRouter(prefix="/api/v1/calls", tags=["Calls"])

# Service singletons
voice_auth_service = MockVoiceAuthenticityService()
speaker_service = SpeakerVerificationService()
behavior_service = BehaviorAnalysisService()
context_service = ContextRiskService()
risk_engine = RiskEngine()

@router.post("", response_model=CallResponse)
async def create_call(payload: CallCreate, db: AsyncSession = Depends(get_db)):
    call = Call(
        organization_id="org-demo-001",
        caller_phone=payload.caller_phone,
        caller_name=payload.caller_name or "Incoming Call",
        claimed_identity=payload.claimed_identity or "Unknown",
        channel=payload.channel or "VoIP",
        language=payload.language or "en",
        status=CallStatus.IN_PROGRESS.value,
        risk_score=0.0,
        risk_level=RiskLevel.LOW.value
    )
    db.add(call)
    await db.commit()
    await db.refresh(call)
    return call

@router.get("", response_model=List[CallResponse])
async def list_calls(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Call).order_by(desc(Call.start_time)).limit(50))
    return res.scalars().all()

@router.get("/{call_id}", response_model=CallResponse)
async def get_call(call_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Call).where(Call.id == call_id))
    call = res.scalars().first()
    if not call:
        # Fallback for dynamic demo IDs
        return CallResponse(
            id=call_id,
            caller_phone="+91 98200 11223",
            caller_name="Caller ID: Executive Office",
            claimed_identity="Rajesh Sharma (CFO)",
            channel="VoIP",
            language="en",
            status=CallStatus.IN_PROGRESS.value,
            risk_score=87.0,
            risk_level=RiskLevel.HIGH.value,
            duration_seconds=124,
            start_time=Call.__table__.columns['start_time'].default.arg()
        )
    return call

@router.get("/{call_id}/risk", response_model=RiskResult)
async def get_call_risk(call_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Call).where(Call.id == call_id))
    call = res.scalars().first()

    claimed_id = call.claimed_identity if call else "Rajesh Sharma (CFO)"
    phone = call.caller_phone if call else "+91 98200 11223"
    score = call.risk_score if call and call.risk_score > 0 else 87.0

    # Determine simulated scenario based on score or identity
    scenario = "ai_impersonation" if score >= 80 else ("suspicious_caller" if score >= 60 else "genuine_executive")
    
    dummy_audio = np.random.randn(4000).astype(np.float32)
    voice_pred = voice_auth_service.predict(dummy_audio, scenario_override=scenario)
    spk_pred = speaker_service.verify(dummy_audio, claimed_speaker="Rajesh Sharma", scenario_override=scenario)
    beh_pred = behavior_service.analyze("transfer immediately before 4 PM", scenario_override=scenario)
    ctx_pred = context_service.evaluate(phone, claimed_id, transaction_amount=2500000.0, scenario_override=scenario)

    result = risk_engine.calculate_risk(voice_pred, spk_pred, beh_pred, ctx_pred, prosody_score=0.72)
    return result

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.db.models import RiskPolicy
from app.schemas.schemas import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/api/v1/settings", tags=["Settings & Policies"])

@router.get("", response_model=SettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(RiskPolicy).where(RiskPolicy.organization_id == "org-demo-001"))
    policy = res.scalars().first()
    if not policy:
        return SettingsResponse(
            high_value_threshold=1000000.0,
            critical_risk_threshold=80.0,
            high_risk_threshold=60.0,
            medium_risk_threshold=30.0,
            weight_synthetic=0.35,
            weight_speaker=0.25,
            weight_prosody=0.10,
            weight_caller=0.10,
            weight_behavior=0.10,
            weight_transaction=0.10,
            audio_retention_days=0
        )
    return policy

@router.put("", response_model=SettingsResponse)
async def update_settings(payload: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(RiskPolicy).where(RiskPolicy.organization_id == "org-demo-001"))
    policy = res.scalars().first()
    if policy:
        if payload.high_value_threshold is not None:
            policy.high_value_threshold = payload.high_value_threshold
        if payload.critical_risk_threshold is not None:
            policy.critical_risk_threshold = payload.critical_risk_threshold
        if payload.audio_retention_days is not None:
            policy.audio_retention_days = payload.audio_retention_days
        if payload.weight_synthetic is not None:
            policy.weight_synthetic = payload.weight_synthetic
        if payload.weight_speaker is not None:
            policy.weight_speaker = payload.weight_speaker
        await db.commit()
        await db.refresh(policy)
        return policy
    return await get_settings(db)

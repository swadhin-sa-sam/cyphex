from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.database import get_db
from app.db.models import Incident
from app.schemas.schemas import IncidentResponse
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])

class IncidentStatusUpdate(BaseModel):
    status: str
    reason: str = "Status updated by SOC analyst"

@router.get("", response_model=List[IncidentResponse])
async def list_incidents(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Incident).order_by(desc(Incident.created_at)).limit(50))
    return res.scalars().all()

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Incident).where(Incident.id == incident_id))
    inc = res.scalars().first()
    if not inc:
        # Demo fallback for VC-28491
        return IncidentResponse(
            id=incident_id,
            call_id="call-sih-001",
            caller="+91 98200 11223",
            claimed_identity="Rajesh Sharma (CFO)",
            risk_score=94.0,
            threat_type="Executive Voice Impersonation",
            transaction_id="tx-sih-001",
            recommended_action="BLOCK",
            actual_action="TRANSACTION_HELD",
            status="BLOCKED",
            timeline=[
                {"time": "10:14:02", "event": "Incoming VoIP call received from unrecognized trunk"},
                {"time": "10:14:15", "event": "Caller claimed identity: Rajesh Sharma (CFO)"},
                {"time": "10:14:28", "event": "Request initiated: ₹25,00,000 wire to ABC Trading Pvt Ltd"},
                {"time": "10:14:35", "event": "Synthetic voice detected (86%) + Speaker Mismatch (78%)"},
                {"time": "10:14:38", "event": "High impersonation risk (94/100). Transaction placed ON HOLD automatically."}
            ],
            created_at=Incident.__table__.columns['created_at'].default.arg()
        )
    return inc

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    inc = await IncidentService.update_status(db, incident_id, payload.status, payload.reason)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return inc

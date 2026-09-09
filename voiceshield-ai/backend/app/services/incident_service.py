from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Incident, IncidentStatus, AuditLog

class IncidentService:
    @staticmethod
    async def create_or_update_incident(
        session: AsyncSession,
        organization_id: str,
        caller: str,
        claimed_identity: str,
        risk_score: float,
        threat_type: str = "Executive Voice Impersonation",
        call_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
        event_note: Optional[str] = None
    ) -> Incident:
        # Check if active incident already exists for this call
        incident = None
        if call_id:
            res = await session.execute(
                select(Incident).where(Incident.call_id == call_id)
            )
            incident = res.scalars().first()

        now_str = datetime.utcnow().strftime("%H:%M:%S")

        if incident:
            incident.risk_score = max(incident.risk_score, risk_score)
            if event_note:
                timeline = list(incident.timeline or [])
                timeline.append({"time": now_str, "event": event_note})
                incident.timeline = timeline
            await session.commit()
            await session.refresh(incident)
            return incident

        # Create new incident
        timeline = [
            {"time": now_str, "event": f"Critical threat detected: {threat_type} (Risk: {risk_score:.0f}/100)"}
        ]
        if event_note:
            timeline.append({"time": now_str, "event": event_note})

        incident = Incident(
            call_id=call_id,
            organization_id=organization_id,
            caller=caller,
            claimed_identity=claimed_identity,
            risk_score=risk_score,
            threat_type=threat_type,
            transaction_id=transaction_id,
            recommended_action="BLOCK",
            actual_action="TRANSACTION_HELD",
            status=IncidentStatus.BLOCKED.value if risk_score >= 80 else IncidentStatus.OPEN.value,
            timeline=timeline
        )
        session.add(incident)

        # Audit log entry
        audit = AuditLog(
            organization_id=organization_id,
            action="INCIDENT_TRIGGERED",
            resource_type="INCIDENT",
            resource_id=incident.id,
            metadata_json={
                "risk_score": risk_score,
                "threat_type": threat_type,
                "caller": caller,
                "claimed_identity": claimed_identity
            }
        )
        session.add(audit)

        await session.commit()
        await session.refresh(incident)
        return incident

    @staticmethod
    async def update_status(
        session: AsyncSession,
        incident_id: str,
        new_status: str,
        reason: Optional[str] = None
    ) -> Optional[Incident]:
        res = await session.execute(select(Incident).where(Incident.id == incident_id))
        incident = res.scalars().first()
        if incident:
            incident.status = new_status
            timeline = list(incident.timeline or [])
            now_str = datetime.utcnow().strftime("%H:%M:%S")
            timeline.append({"time": now_str, "event": f"Status changed to {new_status}: {reason or 'By SOC Operator'}"})
            incident.timeline = timeline
            await session.commit()
            await session.refresh(incident)
        return incident

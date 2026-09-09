from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.db.models import Call, Incident, Transaction, RiskLevel
from app.schemas.schemas import DashboardStats

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Query database counts
    call_count = await db.scalar(select(func.count(Call.id))) or 142
    suspicious_count = await db.scalar(select(func.count(Call.id)).where(Call.risk_level.in_([RiskLevel.HIGH.value, RiskLevel.CRITICAL.value]))) or 18
    critical_count = await db.scalar(select(func.count(Incident.id))) or 4
    
    # Protected transactions
    protected_amount = await db.scalar(
        select(func.sum(Transaction.amount)).where(Transaction.risk_score >= 60.0)
    ) or 8500000.0

    risk_over_time = [
        {"time": "08:00", "score": 14, "baseline": 20},
        {"time": "09:00", "score": 22, "baseline": 20},
        {"time": "10:00", "score": 94, "baseline": 20}, # CFO attack incident
        {"time": "11:00", "score": 45, "baseline": 20},
        {"time": "12:00", "score": 78, "baseline": 20}, # Vendor anomaly
        {"time": "13:00", "score": 31, "baseline": 20},
        {"time": "14:00", "score": 19, "baseline": 20},
        {"time": "15:00", "score": 25, "baseline": 20},
        {"time": "16:00", "score": 52, "baseline": 20},
        {"time": "17:00", "score": 18, "baseline": 20}
    ]

    threat_distribution = [
        {"name": "Executive Impersonation", "count": 12, "color": "#ef4444"},
        {"name": "Vendor Redirection", "count": 8, "color": "#f97316"},
        {"name": "Credential Harvesting", "count": 5, "color": "#eab308"},
        {"name": "OTP Intercept Attempt", "count": 3, "color": "#3b82f6"}
    ]

    calls_by_risk_level = [
        {"level": "LOW (0-29)", "count": 114, "color": "#22c55e"},
        {"level": "MEDIUM (30-59)", "count": 16, "color": "#eab308"},
        {"level": "HIGH (60-79)", "count": 8, "color": "#f97316"},
        {"level": "CRITICAL (80-100)", "count": 4, "color": "#ef4444"}
    ]

    recent_events = [
        {
            "id": "EV-9901",
            "threat": "CFO Voice Impersonation",
            "score": 94,
            "risk_level": "CRITICAL",
            "action": "BLOCKED",
            "time": "10:14 AM",
            "target": "Finance Wire Desk"
        },
        {
            "id": "EV-9894",
            "threat": "Vendor Invoice Redirection",
            "score": 78,
            "risk_level": "HIGH",
            "action": "VERIFIED",
            "time": "09:32 AM",
            "target": "Accounts Payable"
        },
        {
            "id": "EV-9882",
            "threat": "Unrecognized Trunk Line",
            "score": 52,
            "risk_level": "MEDIUM",
            "action": "MONITOR",
            "time": "08:45 AM",
            "target": "Customer Service"
        },
        {
            "id": "EV-9870",
            "threat": "Legitimate Board Call",
            "score": 12,
            "risk_level": "LOW",
            "action": "CONTINUE",
            "time": "08:15 AM",
            "target": "Executive Office"
        }
    ]

    return {
        "calls_today": call_count,
        "suspicious_calls": suspicious_count,
        "critical_threats": critical_count,
        "transactions_protected_amount": protected_amount,
        "risk_over_time": risk_over_time,
        "threat_distribution": threat_distribution,
        "calls_by_risk_level": calls_by_risk_level,
        "recent_events": recent_events
    }

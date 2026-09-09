from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db, init_db

router = APIRouter(prefix="/api/v1/demo", tags=["Demo Simulation"])

@router.get("/scenarios")
async def get_demo_scenarios():
    return [
        {
            "id": "genuine_executive",
            "name": "Scenario 1: Genuine Executive",
            "caller": "Rajesh Sharma (CFO)",
            "phone": "+91 98200 99887",
            "claimed_identity": "Chief Financial Officer",
            "amount": 250000.0,
            "synthetic_score": 8,
            "speaker_match": 96,
            "context_risk": 10,
            "overall_risk": 12,
            "status": "TRUSTED",
            "status_color": "green",
            "action": "ALLOW / CONTINUE",
            "description": "Authentic call from verified CFO corporate mobile discussing routine quarterly budget allocation."
        },
        {
            "id": "suspicious_caller",
            "name": "Scenario 2: Suspicious Caller",
            "caller": "Unverified Vendor Contact",
            "phone": "+91 98450 44332",
            "claimed_identity": "Accounts Payable Vendor",
            "amount": 750000.0,
            "synthetic_score": 45,
            "speaker_match": 62,
            "context_risk": 70,
            "overall_risk": 67,
            "status": "VERIFY",
            "status_color": "yellow",
            "action": "SECONDARY_VERIFICATION_REQUIRED",
            "description": "Vendor representative requesting urgent change of bank details with borderline prosodic anomalies."
        },
        {
            "id": "ai_impersonation",
            "name": "Scenario 3: AI Voice Impersonation (Flagship)",
            "caller": "Spoofed Executive Office",
            "phone": "+91 98200 11223",
            "claimed_identity": "Rajesh Sharma (CFO)",
            "amount": 2500000.0,
            "synthetic_score": 91,
            "speaker_match": 34,
            "context_risk": 92,
            "overall_risk": 94,
            "status": "CRITICAL",
            "status_color": "red",
            "action": "BLOCK SENSITIVE ACTION & HOLD TRANSACTION",
            "animation_steps": [10, 24, 42, 61, 78, 94],
            "description": "Adversary employing neural diffusion voice clone of CFO demanding immediate ₹25 Lakh wire transfer to unverified beneficiary."
        }
    ]

@router.post("/reset")
async def reset_demo(db: AsyncSession = Depends(get_db)):
    """
    Reset all transactions, incidents, and calls back to initial demo state.
    """
    await init_db()
    return {"message": "Demo environment reset to pristine baseline."}

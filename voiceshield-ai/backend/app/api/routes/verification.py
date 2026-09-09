from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.schemas import VerificationRequestCreate, VerificationConfirm
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/api/v1/verification", tags=["Secondary Verification"])

@router.post("/request")
async def request_verification(payload: VerificationRequestCreate, db: AsyncSession = Depends(get_db)):
    req = await VerificationService.request_verification(
        session=db,
        method=payload.method,
        target_contact=payload.target_contact,
        transaction_id=payload.transaction_id,
        call_id=payload.call_id
    )
    return {
        "verification_id": req.id,
        "method": req.method,
        "target_contact": req.target_contact,
        "status": req.status,
        "challenge_code": req.challenge_code,
        "message": f"Verification challenge dispatched to {req.target_contact}."
    }

@router.post("/confirm")
async def confirm_verification(payload: VerificationConfirm, db: AsyncSession = Depends(get_db)):
    result = await VerificationService.confirm_verification(
        session=db,
        verification_id=payload.verification_id,
        challenge_code=payload.challenge_code
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

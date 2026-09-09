import random
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import (
    VerificationRequest, VerificationStatus, VerificationMethod,
    Transaction, TransactionStatus, Call, RiskLevel
)

class VerificationService:
    @staticmethod
    async def request_verification(
        session: AsyncSession,
        method: str = VerificationMethod.SMS_OTP.value,
        target_contact: Optional[str] = None,
        transaction_id: Optional[str] = None,
        call_id: Optional[str] = None,
        current_risk: float = 91.0
    ) -> VerificationRequest:
        # Generate 6-digit challenge code
        challenge = f"{random.randint(100000, 999999)}"
        contact = target_contact or "+91 98200 99887 (Official CFO Registered Mobile)"

        req = VerificationRequest(
            transaction_id=transaction_id,
            call_id=call_id,
            method=method,
            target_contact=contact,
            challenge_code=challenge,
            status=VerificationStatus.PENDING.value,
            risk_before=current_risk
        )
        session.add(req)
        await session.commit()
        await session.refresh(req)
        return req

    @staticmethod
    async def confirm_verification(
        session: AsyncSession,
        verification_id: str,
        challenge_code: str
    ) -> Dict[str, Any]:
        res = await session.execute(
            select(VerificationRequest).where(VerificationRequest.id == verification_id)
        )
        v_req = res.scalars().first()
        if not v_req:
            return {"success": False, "message": "Verification request not found."}

        # In demo mode, accept correct challenge or standard demo code '123456'
        if challenge_code != v_req.challenge_code and challenge_code != "123456":
            v_req.status = VerificationStatus.FAILED.value
            await session.commit()
            return {"success": False, "message": "Invalid verification code entered."}

        # Verification Successful: Reduce Risk dramatically (e.g., from 91 -> 12)
        v_req.status = VerificationStatus.SUCCESS.value
        v_req.verified_at = datetime.utcnow()
        v_req.risk_after = 12.0

        # If linked to a transaction, unhold it
        if v_req.transaction_id:
            tx_res = await session.execute(
                select(Transaction).where(Transaction.id == v_req.transaction_id)
            )
            tx = tx_res.scalars().first()
            if tx:
                tx.status = TransactionStatus.PENDING.value
                tx.risk_score = 12.0
                tx.notes = (tx.notes or "") + " [MFA VERIFIED: Secondary authorization validated]"

        # If linked to a call, update call risk score
        if v_req.call_id:
            call_res = await session.execute(
                select(Call).where(Call.id == v_req.call_id)
            )
            call = call_res.scalars().first()
            if call:
                call.risk_score = 12.0
                call.risk_level = RiskLevel.LOW.value
                call.status = "VERIFIED"

        await session.commit()
        await session.refresh(v_req)

        return {
            "success": True,
            "message": "Out-of-band identity verification successful. Risk score mitigated.",
            "risk_before": v_req.risk_before,
            "risk_after": 12.0,
            "status": "VERIFIED"
        }

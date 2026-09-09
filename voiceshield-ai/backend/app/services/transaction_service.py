from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.db.models import Transaction, TransactionStatus, Call

class TransactionService:
    @staticmethod
    async def create_transaction(
        session: AsyncSession,
        organization_id: str,
        amount: float,
        beneficiary_name: str,
        beneficiary_account: str,
        requested_by: str,
        call_id: Optional[str] = None,
        risk_score: float = 0.0,
        notes: Optional[str] = None
    ) -> Transaction:
        # Automatic Hold Rule: If risk >= 80, transaction must be put ON_HOLD
        status = TransactionStatus.PENDING.value
        if risk_score >= 80.0:
            status = TransactionStatus.ON_HOLD.value
            notes = (notes or "") + " [AUTO-HOLD: Critical Voice Impersonation Risk >= 80]"
        elif risk_score >= 60.0:
            status = TransactionStatus.VERIFICATION_REQUIRED.value
            notes = (notes or "") + " [VERIFICATION REQUIRED: High Voice Risk]"

        tx = Transaction(
            call_id=call_id,
            organization_id=organization_id,
            amount=amount,
            currency="INR",
            beneficiary_name=beneficiary_name,
            beneficiary_account=beneficiary_account,
            requested_by=requested_by,
            risk_score=risk_score,
            status=status,
            notes=notes
        )
        session.add(tx)
        await session.commit()
        await session.refresh(tx)
        return tx

    @staticmethod
    async def evaluate_active_call_transaction(
        session: AsyncSession,
        call_id: str,
        new_risk_score: float
    ) -> Optional[Transaction]:
        """
        If a call has an associated pending transaction and risk crosses 80, auto-place ON_HOLD.
        """
        res = await session.execute(
            select(Transaction).where(Transaction.call_id == call_id)
        )
        tx = res.scalars().first()
        if tx and tx.status in [TransactionStatus.PENDING.value, TransactionStatus.VERIFICATION_REQUIRED.value]:
            tx.risk_score = new_risk_score
            if new_risk_score >= 80.0:
                tx.status = TransactionStatus.ON_HOLD.value
                tx.notes = "[AUTOMATIC SECURITY HOLD: Risk score elevated to critical threshold]"
                await session.commit()
                await session.refresh(tx)
        return tx

    @staticmethod
    async def approve_transaction(session: AsyncSession, transaction_id: str) -> Optional[Transaction]:
        res = await session.execute(select(Transaction).where(Transaction.id == transaction_id))
        tx = res.scalars().first()
        if tx:
            tx.status = TransactionStatus.APPROVED.value
            tx.notes = (tx.notes or "") + " [MANUALLY APPROVED BY AUTHORIZED OPERATOR]"
            await session.commit()
            await session.refresh(tx)
        return tx

    @staticmethod
    async def reject_transaction(session: AsyncSession, transaction_id: str, reason: str = "Fraud suspected") -> Optional[Transaction]:
        res = await session.execute(select(Transaction).where(Transaction.id == transaction_id))
        tx = res.scalars().first()
        if tx:
            tx.status = TransactionStatus.REJECTED.value
            tx.notes = f"[REJECTED: {reason}]"
            await session.commit()
            await session.refresh(tx)
        return tx

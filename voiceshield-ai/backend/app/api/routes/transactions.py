from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.database import get_db
from app.db.models import Transaction, TransactionStatus
from app.schemas.schemas import TransactionCreate, TransactionResponse
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])

@router.post("", response_model=TransactionResponse)
async def create_transaction(payload: TransactionCreate, db: AsyncSession = Depends(get_db)):
    tx = await TransactionService.create_transaction(
        session=db,
        organization_id="org-demo-001",
        amount=payload.amount,
        beneficiary_name=payload.beneficiary_name,
        beneficiary_account=payload.beneficiary_account,
        requested_by=payload.requested_by,
        call_id=payload.call_id,
        notes=payload.notes
    )
    return tx

@router.get("", response_model=List[TransactionResponse])
async def list_transactions(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Transaction).order_by(desc(Transaction.created_at)).limit(50))
    return res.scalars().all()

@router.post("/{transaction_id}/approve", response_model=TransactionResponse)
async def approve_transaction(transaction_id: str, db: AsyncSession = Depends(get_db)):
    tx = await TransactionService.approve_transaction(db, transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return tx

@router.post("/{transaction_id}/reject", response_model=TransactionResponse)
async def reject_transaction(transaction_id: str, db: AsyncSession = Depends(get_db)):
    tx = await TransactionService.reject_transaction(db, transaction_id, reason="Impersonation risk confirmed")
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return tx

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_user
from app.services.auth.models import User
from app.services.transaction.models import TransactionRead, TransactionCreate
from app.services.transaction.service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionRead])
def get_transactions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    type: Optional[str] = Query(None, description="Lọc theo loại: INCOME hoặc EXPENSE"),
    category_id: Optional[str] = Query(None, description="Lọc theo mã danh mục"),
    start_date: Optional[datetime] = Query(None, description="Thời gian bắt đầu"),
    end_date: Optional[datetime] = Query(None, description="Thời gian kết thúc"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng giao dịch tối đa"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu lấy")
):
    return TransactionService.get_transactions(
        session=session,
        user_id=current_user.id,
        type=type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset
    )

@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return TransactionService.create_transaction(session, tx_in, current_user.id)

@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: str,
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return TransactionService.update_transaction(session, transaction_id, tx_in, current_user.id)

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return TransactionService.delete_transaction(session, transaction_id, current_user.id)

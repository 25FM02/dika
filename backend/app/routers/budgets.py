from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_user
from app.services.auth.models import User
from app.services.budget.models import BudgetRead, BudgetCreate, BudgetProgress
from app.services.budget.service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetProgress])
def get_budgets_progress(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    month: int = Query(default_factory=lambda: datetime.utcnow().month, description="Tháng cần lấy (1-12)"),
    year: int = Query(default_factory=lambda: datetime.utcnow().year, description="Năm cần lấy")
):
    return BudgetService.get_budgets_progress(session, current_user.id, month, year)

@router.post("", response_model=BudgetRead)
def set_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return BudgetService.set_budget(session, budget_in, current_user.id)

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return BudgetService.delete_budget(session, budget_id, current_user.id)

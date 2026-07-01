from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_user
from app.services.auth.models import User
from app.services.statistics.service import StatisticsService

router = APIRouter(prefix="/statistics", tags=["Statistics"])

@router.get("/summary")
def get_summary(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    month: int = Query(default_factory=lambda: datetime.utcnow().month),
    year: int = Query(default_factory=lambda: datetime.utcnow().year)
):
    return StatisticsService.get_summary(session, current_user.id, month, year)

@router.get("/category-distribution")
def get_category_distribution(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    type: str = Query("EXPENSE", description="Loại giao dịch: INCOME hoặc EXPENSE"),
    month: int = Query(default_factory=lambda: datetime.utcnow().month),
    year: int = Query(default_factory=lambda: datetime.utcnow().year)
):
    return StatisticsService.get_category_distribution(session, current_user.id, type, month, year)

@router.get("/monthly-trend")
def get_monthly_trend(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit_months: int = Query(6, ge=1, le=12, description="Số lượng tháng hiển thị xu hướng")
):
    return StatisticsService.get_monthly_trend(session, current_user.id, limit_months)

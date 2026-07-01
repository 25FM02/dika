from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_user
from app.services.auth.models import User
from app.services.savings.models import (
    SavingsGoalResponse, 
    SavingsGoalCreate, 
    SavingsGoalUpdate, 
    SavingsTransactionRequest
)
from app.services.savings.service import SavingsService

router = APIRouter(prefix="/savings", tags=["Savings"])

@router.get("", response_model=List[SavingsGoalResponse])
def get_savings_goals(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return SavingsService.get_goals(session, current_user.id)

@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
def create_savings_goal(
    payload: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return SavingsService.create_goal(session, payload, current_user.id)

@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_savings_goal(
    goal_id: str,
    payload: SavingsGoalUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return SavingsService.update_goal(session, goal_id, payload, current_user.id)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_savings_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    SavingsService.delete_goal(session, goal_id, current_user.id)
    return None

@router.post("/{goal_id}/deposit", response_model=SavingsGoalResponse)
def deposit_to_savings_goal(
    goal_id: str,
    payload: SavingsTransactionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return SavingsService.deposit_to_goal(session, goal_id, payload.amount, current_user.id)

@router.post("/{goal_id}/withdraw", response_model=SavingsGoalResponse)
def withdraw_from_savings_goal(
    goal_id: str,
    payload: SavingsTransactionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return SavingsService.withdraw_from_goal(session, goal_id, payload.amount, current_user.id)
